import console                        from 'console';
import { TimeoutManager }             from 'shared/timeout-manager';
import config                         from '../config/config';
import { queryDatabase }              from '../db/query';
import type { Scenario }              from './scenario/objects/scenario';
import type { Client }                from './sockets/client';
import type { ServerEvent }           from 'shared/network/events/server-event';
import type { MultipleAttributeInfo } from 'shared/network/scenario/i-attribute-info';
import type { IBoardInfo }            from 'shared/network/scenario/i-board-info';
import type { IPlayerInfo }           from 'shared/network/scenario/i-player-info';
import type { IShipPrototypeInfo }    from 'shared/network/scenario/i-ship-prototype-info';

/**
 * Game - Server Version
 *
 * Stores all information about a game in progress
 */
export class Game {

    public readonly timeoutManager: TimeoutManager<'gameJoinTimeout' | 'startSetup'>;
    public clients: Client[] = [];

    private _gamePhase: GamePhase = GamePhase.Lobby;
    public gameKilledCallback: ((reason: string) => void) | undefined;

    /**
     * Game constructor
     *
     * @param  internalID Internal ID given to game in database
     * @param  gameID     Published game ID used by clients to connect
     * @param  scenario   Scenario object used for game logic
     */
    public constructor(private readonly internalID: number,
                       public readonly gameID: string,
                       public readonly scenario: Scenario) {

        this.scenario.game = this;

        // Set timeout function for entering the setup phase of the game
        this.timeoutManager = new TimeoutManager({
            gameJoinTimeout: [() => {}, 0, false],
            startSetup: [() => this.startSetup(), config.gameStartWaitDuration, false]
        });
    }

    /**
     * Joins a client to the game
     *
     * @param  client Client to join to the game
     */
    public joinClient(client: Client): void {
        console.log(`Client ${client.id} joined game ${this.gameID}`);

        this.timeoutManager.stopTimeout('gameJoinTimeout');
        this.clients.push(client);

        // Register close handler for client
        client.ws.onclose = () => this.disconnectClient(client, false);

        // Send client information about the scenario
        client.sendEvent({
            event: 'gameInfo',
            scenario: this.scenario.makeTransportable(),
            playerInfo: this.getPlayerInfo()
        });

        // Broadcast player join to all existing clients
        for (const existingClient of this.clients) {
            if (existingClient === client)
                continue;

            existingClient.sendEvent({
                event: 'playerJoin',
                player: client.identity,
                reconnection: false
            });
        }
    }

    /**
     * Disconnects a client from this game
     *
     * @param  client            Client to disconnect from the game
     * @param  allowReconnection Whether to allow client to reconnect to the game, or to remove them completely
     */
    private disconnectClient(client: Client, allowReconnection: boolean): void {
        console.log(`Client ${client.identity} disconnected from game ${this.gameID}`);

        // Construct new array of clients and broadcast disconnect event to existing clients
        let newClients: Client[] = [];
        for (const existingClient of this.clients) {
            if (existingClient === client)
                continue;

            newClients.push(existingClient);
            existingClient.sendEvent({
                event: 'playerLeave',
                player: client.identity,
                temporary: allowReconnection
            });
        }

        client.connected = false;
        if (!allowReconnection)
            this.clients = newClients;
        else {
            client.allowReconnection = true;
            client.timeoutManager.startTimeout('reconnection');
        }

        // If no clients are connected to this game, start a game timeout
        if (this.clients.length === 0)
            this.timeoutManager.startTimeout('gameJoinTimeout');
    }

    /**
     * Checks if a client with a matching identity is in this game
     *
     * @param    identity Identity to search for client
     * @returns           Found client
     */
    public findClient(identity: string): Client | undefined {
        for (const client of this.clients)
            if (client.identity === identity)
                return client;
        return undefined;
    }

    /**
     * Reconnects a client to this game
     *
     * @param  client Client to reconnect to the game
     */
    public reconnectClient(client: Client): void {
        console.log(`Client ${client.id} reconnected to game ${this.gameID}`);
        client.connected = true;
        client.inactive = false;
        client.timeoutManager.stopTimeout('reconnection');

        // Register close handler for new websocket
        client.ws.onclose = () => this.disconnectClient(client, true);

        // Publish reconnection to existing clients
        for (const existingClient of this.clients) {
            if (existingClient === client)
                continue;
            existingClient.sendEvent({
                event: 'playerJoin',
                player: client.identity,
                reconnection: true
            });
        }

        // Get ship information for this client
        const ships: { [trackingID: string]: IShipPrototypeInfo } = {};
        for (const [trackingID, ship] of Object.entries(client.player!.ships))
            ships[trackingID] = client.shipsPlaced
                ? ship.makeTransportable(false, true)
                : ship.makeTransportable(true, false);

        // Resend game information
        client.sendEvent({
            event: 'gameInfo',
            scenario: this.scenario.makeTransportable(),
            playerInfo: this.getPlayerInfo()
        });
        client.sendEvent({
            event: 'setupInfo',
            ...this.getCommonSetupInfo(),
            spawnRegion: client.player!.spawnRegionID,
            ships: ships
        });

        if (this._gamePhase !== GamePhase.InProgress)
            return;

        // Notify client of all ships that are known to them
        for (const team of Object.values(this.scenario.teams)) {
            for (const player of team.players) {
                if (player === client.player)
                    continue;
                for (const ship of Object.values(player.ships)) {
                    const trackingID = ship.getTrackingID(client.team!);
                    if (trackingID === undefined)
                        continue;
                    client.sendEvent({
                        event: 'shipAppear',
                        trackingID: trackingID,
                        shipInfo: ship.makeTransportable(false, false)
                    });
                }
            }
        }

        client.sendEvent({
            event: 'gameStart'
        });
    }

    /**
     * Constructs a dictionary of team assignments and readiness info for each client
     *
     * @returns  Dictionary mapping player identities to [team id, ready] arrays
     */
    private getPlayerInfo(): { [id: string]: [string, boolean] | [null, false] } {
        const playerInfo: { [id: string]: [string, boolean] | [null, false] } = {};
        for (const client of this.clients)
            playerInfo[client.identity] = client.team 
                ? [ client.team.id, client.ready ] 
                : [null, false];
        return playerInfo;
    }

    /**
     * Constructs part of ISetupInfoEvent common between individual clients
     *
     * @returns  Partial ISetupInfoEvent object
     */
    private getCommonSetupInfo(): {
        boardInfo: IBoardInfo,
        turnOrder: string[],
        playerInfo: { [identity: string]: IPlayerInfo },
        teamAttributes: { [id: string]: MultipleAttributeInfo }
        scenarioAttributes: MultipleAttributeInfo,
        turnStartIndex: number,
        maxTurnTime: number
        } {

        const playerInfo: { [identity: string]: IPlayerInfo } = {};
        for (const client of this.clients)
            playerInfo[client.identity] = client.player!.makeTransportable();

        const teamAttributes: { [id: string]: MultipleAttributeInfo } = {};
        for (const [id, team] of Object.entries(this.scenario.teams))
            teamAttributes[id] = team.attributeWatcher.exportAttributeInfo();

        return {
            boardInfo: this.scenario.board.makeTransportable(),
            turnOrder: this.scenario.turnManager.turnOrder.map(p => p.client!.identity),
            playerInfo: playerInfo,
            teamAttributes: teamAttributes,
            scenarioAttributes: this.scenario.attributeWatcher.exportAttributeInfo(),
            turnStartIndex: this.scenario.turnManager.currentTurnIndex,
            maxTurnTime: this.scenario.turnManager.turnTimeout
        };
    }

    /**
     * Checks whether the game can enter the setup phase yet and enters it if it can
     */
    public attemptGameSetup(): void {

        // Set game phase to lobby in-case game is starting
        this._gamePhase = GamePhase.Lobby;
        this.timeoutManager.stopTimeout('startSetup');

        // Create a counter for the number of players in each team
        const teamPlayerCounts: { [name: string]: number } = {};
        for (const name of Object.keys(this.scenario.teams))
            teamPlayerCounts[name] = 0;

        // Iterate through connected clients
        for (const client of this.clients) {
            if (!client.ready) {
                this.broadcastEvent({
                    event: 'enterSetupFailure',
                    reason: 'Waiting for all players to be ready...'
                });
                return;
            }

            // Increment the player count for the team they are on
            teamPlayerCounts[client.team!.id]++;
        }

        // Check that every team has a number of players supported by the scenario definition
        for (const [name, playerCount] of Object.entries(teamPlayerCounts)) {
            const team = this.scenario.teams[name];
            const maxPlayers = team.playerPrototypes.length;

            // If there are an invalid number of players for the team
            if (playerCount === 0 || playerCount > maxPlayers) {

                // Select reason to provide for game start failure
                const reason = playerCount === 0
                    ? 'All teams must have at least 1 player'
                    : `Team '${team.descriptor.name}' supports a maximum of ${maxPlayers} players`;

                // Broadcast game setup failure event to all clients
                this.broadcastEvent({
                    event: 'enterSetupFailure',
                    reason: reason
                });
                return;
            }
        }

        // Broadcast game entering setup
        this.broadcastEvent({
            event: 'enteringSetup',
            waitDuration: config.gameStartWaitDuration
        });

        // Set game phase to starting
        this._gamePhase = GamePhase.EnteringSetup;
        this.timeoutManager.startTimeout('startSetup');

        // Debug
        console.log(`${this.gameID} is entering setup`);
    }

    /**
     * Enters the setup phase of the game
     */
    private startSetup(): void {

        // Set game phase to setup
        this._gamePhase = GamePhase.Setup;

        // Register new close handler for client, allowing for reconnection
        for (const client of this.clients) {
            client.ws.onclose = () => this.disconnectClient(client, true);
            client.timeoutManager.setTimeoutFunction('reconnection', () => {
                client.inactive = true;
                client.player!.team.checkInactive();
                this.broadcastEvent({
                    event: 'playerTimedOut',
                    player: client.identity
                });
                if (this.scenario.turnManager.currentTurn === client.player)
                    this.scenario.turnManager.advanceTurn(true);
            }, undefined, false, false);
        }

        // Group players by their teams
        const teamGroups: { [name: string]: Client[] } = {};
        for (const client of this.clients) {
            const teamName = client.team!.id;
            if (teamGroups[teamName] === undefined)
                teamGroups[teamName] = [];
            teamGroups[teamName].push(client);
        }

        // Setup teams with sets of players
        for (const [teamName, clients] of Object.entries(teamGroups)) {
            const team = this.scenario.teams[teamName];
            team.setPlayers(clients);
        }

        // Generate dictionary of player colors
        const playerColors: { [id: string]: [string, string] } = {};
        for (const client of this.clients) {
            playerColors[client.identity] = [client.player!.color, client.player!.highlightColor];
        }

        this.scenario.turnManager.generateTurns();
        const commonSetupInfo = this.getCommonSetupInfo();

        // Send setup info to clients
        for (const client of this.clients) {

            // Get ship information for each client
            const ships: { [trackingID: string]: IShipPrototypeInfo } = {};
            for (const [trackingID, ship] of Object.entries(client.player!.ships))
                ships[trackingID] = ship.makeTransportable(true, false);

            client.sendEvent({
                event: 'setupInfo',
                ...commonSetupInfo,
                spawnRegion: client.player!.spawnRegionID,
                ships: ships
            });
        }
    }

    /**
     * Checks whether the game can start and starts the game if it can
     */
    public attemptGameStart(): void {

        // Check if all players have placed their ships
        for (const client of this.clients) {
            if (!client.shipsPlaced)
                return;
        }

        this.startGame();
    }

    /**
     * Starts the game
     */
    public startGame(): void {
        this.scenario.eventRegistrar.queueEvent('onGameStart', {
            builtinAttributes: {},
            locations: {}
        });
        this.scenario.turnManager.start();
        this.scenario.eventRegistrar.evaluateEvents();

        this._gamePhase = GamePhase.InProgress;
        this.broadcastEvent({
            event: 'gameStart'
        });
    }

    /**
     * Ends the game
     *
     * @param  winningTeamID Team that is declaring as having won the game
     * @param  winMessage    Winning message to display to users
     */
    public endGame(winningTeamID: string, winMessage: string): void {
        this._gamePhase = GamePhase.Finished;
        this.broadcastEvent({
            event: 'gameOver',
            winningTeam: winningTeamID,
            message: winMessage
        });

        // Record game results
        const queryStatementSections: string[] = [];
        const values: (number | string | boolean)[] = [];
        for (const client of this.clients) {
            queryStatementSections.push('(?, ?, ?)');
            values.push(this.internalID);
            values.push(client.username);
            values.push(!client.player!.team.lost && !client.player!.team.inactive);
        }
        const query1 = `UPDATE game SET completion = CURRENT_TIMESTAMP WHERE id = ${this.internalID};`;
        const query2 = `INSERT INTO result (game_id, username, won) VALUES ${queryStatementSections.join(',')};`;
        queryDatabase(query1).then(async () =>
            queryDatabase(query2, values).then(() =>
                this.killGame('Game over')
            )
        );
    }

    /**
     * Ends the game without sending a message to clients
     *
     * @param  reason Reason that the game was terminated
     */
    public killGame(reason: string): void {
        this._gamePhase = GamePhase.Killed;
        this.timeoutManager.disable();
        for (const client of this.clients)
            client.ws.close(1000);
        this.clients = [];
        this.scenario.deconstruct();
        this.gameKilledCallback?.(reason);
    }

    /**
     * Broadcasts a server event to all connected clients
     *
     * @param  serverEvent Event to broadcast
     */
    public broadcastEvent(serverEvent: ServerEvent): void {
        for (const client of this.clients) {
            client.sendEvent(serverEvent);
        }
    }

    /**
     * Getters and setters
     */

    public get gamePhase(): GamePhase {
        return this._gamePhase;
    }
}

/**
 * Enum describing different phases that the game can be in
 */
export const enum GamePhase {
    Lobby,
    EnteringSetup,
    Setup,
    InProgress,
    Finished,
    Killed
}
