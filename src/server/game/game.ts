import * as console from 'console';
import config from '../config';
import {Scenario} from './scenario/scenario';
import {Client} from './sockets/client';

/**
 * Game - Server Version
 *
 * Stores all information about a game in progress
 */
export class Game {
    protected timeoutID: NodeJS.Timeout | undefined;
    protected _clients: Client[] = [];

    protected _started: boolean = false;

    /**
     * Game constructor
     * @param internalID Internal ID given to game in database
     * @param gameID Published game ID used by clients to connect
     * @param scenario Scenario object used for game logic
     * @param timeoutFunction Function to call on game timeout
     */
    public constructor(public readonly internalID: number,
                       public readonly gameID: string,
                       public readonly scenario: Scenario,
                       protected readonly timeoutFunction: (gameID: string) => void) {

        // Start a timeout for the game
        this.startTimeout(config.gameJoinTimeout);
    }

    /**
     * Joins a client to the game
     * @param client Client to join to the game
     */
    public joinClient(client: Client) {

        // Debug
        console.log(`Client ${client.id} joined game ${this.gameID}`);

        // Stop game timeout
        this.stopTimeout();

        // Add client to list of clients
        this._clients.push(client);

        // When client disconnects, remove them from list of clients
        client.ws.on('close', () => {
            this._clients = this._clients.filter(c => c !== client);

            // Debug
            console.log(`Client ${client.identity} disconnected from game ${this.gameID}`);

            // Broadcast disconnect event to existing clients
            for (let existingClient of this._clients) {
                existingClient.sendEvent({
                    event: 'playerLeave',
                    playerIdentity: client.identity
                });
            }

            // If no clients are connected to this game, start a game timeout
            if (this._clients.length === 0)
                this.startTimeout(config.gameJoinTimeout);
        });

        // Send client information about the scenario
        client.sendEvent({
            event: 'gameInfo',
            scenario: this.scenario.makeTransportable()
        });

        // Broadcast player join to all existing clients
        for (let existingClient of this._clients) {
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
     * Starts the game
     */
    public startGame() {
        console.log(`Starting game ${this.gameID}`);
        this._started = true;

        // Broadcast game start
        for (let client of this._clients) {
            client.sendEvent({
                event: 'gameStart'
            });
        }
    }

    /**
     * Starts, or restarts the game timeout
     * @param duration
     */
    public startTimeout(duration: number) {
        if (this.timeoutID !== undefined)
            this.stopTimeout();

        this.timeoutID = setTimeout(() => this.timeoutFunction(this.gameID), duration);
    }

    /**
     * Stops the game from timing out
     */
    public stopTimeout() {
        if (this.timeoutID === undefined)
            return;
        clearTimeout(this.timeoutID);
    }

    /**
     * Getters and setters
     */

    public get clients(): Client[] {
        return this._clients;
    }

    public get started(): boolean {
        return this._started;
    }
}