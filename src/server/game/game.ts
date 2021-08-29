import * as console from 'console';
import { IServerEvent } from '../../shared/network/events/i-server-event';
import { TimeoutManager } from '../../shared/timeout-manager';
import config from '../config';
import { Scenario } from './scenario/scenario';
import { Client } from './sockets/client';

/**
 * Game - Server Version
 *
 * Stores all information about a game in progress
 */
export class Game {

    public timeoutManager = new TimeoutManager({
        gameJoinTimeout: [ () => {}, 0, false ],
        startGame: [ () => {}, 0, false ]
    });

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

        // Set timeout function for starting game
        this.timeoutManager.setTimeoutFunction('startGame', () => this.startGame(), config.gameStartWaitDuration, false);
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

        // Send client information about the scenario
        client.sendEvent({
            event: 'gameInfo',
            scenario: this.scenario.makeTransportable()
        });

        for (const existingClient of this.clients) {
            existingClient.sendEvent({
                event: 'playerJoin',
                playerIdentity: client.identity,
                team: client.team?.id,
                ready: client.ready
            });

            // Broadcast existing client information to new client
            if (existingClient !== client) {
                client.sendEvent({
                    event: 'playerJoin',
                    playerIdentity: existingClient.identity,
                    team: existingClient.team?.id,
                    ready: client.ready
                });
            }
        }
    }

    /**
     * Checks whether the game can be started yet and starts the game if it can
     */
    public attemptGameStart(): void {

        // Set game phase to lobby in-case game is starting
        this._gamePhase = GamePhase.Lobby;
        this.timeoutManager.stopTimeout('startGame');

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
                    event: 'gameStartFailure',
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

                // Broadcast game start failure event to all clients
                this.broadcastEvent({
                    event: 'gameStartFailure',
                    reason: reason
                });
                return;
            }
        }

        // Broadcast game starting
        this.broadcastEvent({
            event: 'gameStarting',
            waitDuration: config.gameStartWaitDuration
        });

        // Set game phase to starting
        this._gamePhase = GamePhase.Starting;
        this.timeoutManager.startTimeout('startGame');

        // Debug
        console.log(`Starting game ${this.gameID}`);
    }

    /**
     * Starts the game
     */
    public startGame(): void {

        // Set game phase to started
        this._gamePhase = GamePhase.Started;

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

        // Broadcast game start
        for (const client of this.clients) {
            client.sendEvent({
                event: 'gameStart',
                boardInfo: this.scenario.board.makeTransportable(),
                playerInfo: client.player!.makeTransportable()
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
    Starting,
    Started
}
