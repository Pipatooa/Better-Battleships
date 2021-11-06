import * as console from 'console';
import type { IServerEvent } from '../../shared/network/events/i-server-event';
import { TimeoutManager } from '../../shared/timeout-manager';
import config from '../config';
import type { Scenario } from './scenario/objects/scenario';
import type { Client } from './sockets/client';

/**
 * Game - Server Version
 *
 * Stores all information about a game in progress
 */
export class Game {

    public readonly timeoutManager: TimeoutManager<'gameJoinTimeout' | 'startSetup'>;

    public clients: Client[] = [];

    protected _gamePhase: GamePhase = GamePhase.Lobby;

    /**
     * Game constructor
     *
     * @param  internalID Internal ID given to game in database
     * @param  gameID     Published game ID used by clients to connect
     * @param  scenario   Scenario object used for game logic
     */
    public constructor(public readonly internalID: number,
                       public readonly gameID: string,
                       public readonly scenario: Scenario) {

        // Set timeout function for entering the setup phase of the game
        this.timeoutManager = new TimeoutManager({
            gameJoinTimeout: [() => {}, 0, false],
            startSetup: [() => this.startSetup(), config.gameStartWaitDuration, false]
        });

        // Set callback for turn advancements to notify clients
        this.scenario.turnManager.turnAdvancementCallback = () => this.broadcastEvent({
            event: 'turnAdvancement'
        });
    }

    /**
     * Joins a client to the game
     *
     * @param  client Client to join to the game
     */
    public joinClient(client: Client): void {

        // Debug
        console.log(`Client ${client.id} joined game ${this.gameID}`);

        // Stop game timeout
        this.timeoutManager.stopTimeout('gameJoinTimeout');

        // Add client to list of clients
        this.clients.push(client);

        // When client disconnects, remove them from list of clients
        client.ws.on('close', () => {
            this.clients = this.clients.filter(c => c !== client);

            // Debug
            console.log(`Client ${client.identity} disconnected from game ${this.gameID}`);

            // Broadcast disconnect event to existing clients
            for (const existingClient of this.clients) {
                existingClient.sendEvent({
                    event: 'playerLeave',
                    playerIdentity: client.identity
                });
            }

            // If no clients are connected to this game, start a game timeout
            if (this.clients.length === 0)
                this.timeoutManager.startTimeout('gameJoinTimeout');
        });

        // Create dictionary of team assignments and readiness info for each client
        let playerInfo: { [id: string]: [string, boolean] | [null, false] } = {};
        for (const client of this.clients) {
            if (client.team)
                playerInfo[client.identity] = [client.team.id, client.ready];
            else
                playerInfo[client.identity] = [null, false];
        }

        // Send client information about the scenario
        client.sendEvent({
            event: 'gameInfo',
            scenario: this.scenario.makeTransportable(),
            playerInfo: playerInfo
        });

        // Broadcast player join to all existing clients
        for (const existingClient of this.clients) {

            if (existingClient === client)
                continue;

            existingClient.sendEvent({
                event: 'playerJoin',
                playerIdentity: client.identity,
                team: client.team?.id,
                ready: client.ready
            });
        }
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
        for (const name of Object.keys(this.scenario.teams)) {
            teamPlayerCounts[name] = 0;
        }

        // Iterate through connected clients
        for (const client of this.clients) {

            // Check if player is ready
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
        for (const [ name, playerCount ] of Object.entries(teamPlayerCounts)) {
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
    public startSetup(): void {

        // Set game phase to setup
        this._gamePhase = GamePhase.Setup;

        // Group players by their teams
        const teamGroups: { [name: string]: Client[] } = {};
        for (const client of this.clients) {

            const teamName = client.team!.id;

            // If player is first on their team
            if (!(teamName in teamGroups))
                teamGroups[teamName] = [];

            // Add player to team group
            teamGroups[teamName].push(client);
        }

        // Setup teams with sets of players
        for (const [ teamName, clients ] of Object.entries(teamGroups)) {
            const team = this.scenario.teams[teamName];
            team.setPlayers(clients);
        }

        // Generate dictionary of player colors
        const playerColors: { [id: string]: string } = {};
        for (const client of this.clients) {
            playerColors[client.identity] = client.player!.color;
        }

        // Broadcast game setup info
        for (const client of this.clients) {
            client.sendEvent({
                event: 'setupInfo',
                boardInfo: this.scenario.board.makeTransportable(),
                playerInfo: client.player!.makeTransportable(),
                playerColors: playerColors
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
        this._gamePhase = GamePhase.InProgress;

        // Generate a sequence of turns and start turn timer
        this.scenario.turnManager.start();

        // Broadcast game start to all clients
        for (const client of this.clients) {
            client.sendEvent({
                event: 'gameStart',
                turnOrder: this.scenario.turnManager.turnOrder,
                maxTurnTime: this.scenario.turnManager.turnTimeout
            });
        }
    }

    /**
     * Broadcasts a server event to all connected clients
     *
     * @param  serverEvent Event to broadcast
     */
    public broadcastEvent(serverEvent: IServerEvent): void {
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

export enum GamePhase {
    Lobby,
    EnteringSetup,
    Setup,
    InProgress,
    Finished
}
