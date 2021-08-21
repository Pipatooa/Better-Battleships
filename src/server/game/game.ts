import * as console from 'console';
import config from '../config';
import {queryDatabase} from '../db/query';
import {Scenario} from './scenario/scenario';
import {Client} from './sockets/client';

export class Game {
    protected timeoutID: NodeJS.Timeout | undefined;
    protected _clients: Client[] = [];

    protected _started: boolean = false;

    public constructor(public readonly internalID: number,
                       public readonly gameID: string,
                       public readonly scenario: Scenario,
                       protected readonly timeoutFunction: (gameID: string) => void) {

        this.startTimeout(config.gameJoinTimeout);
    }

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
            })

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

    public startGame() {
        console.log(`Starting game ${this.gameID}`);
        this._started = true;

        // Broadcast game start
        for (let client of this._clients) {
            client.sendEvent({
                event: 'gameStart'
            })
        }
    }

    public startTimeout(duration: number) {
        if (this.timeoutID !== undefined)
            this.stopTimeout();

        this.timeoutID = setTimeout(() => this.timeoutFunction(this.gameID), duration);
    }

    public stopTimeout() {
        if (this.timeoutID === undefined)
            return;
        clearTimeout(this.timeoutID);
    }

    // Getters and setters
    public get clients(): Client[] {
        return this._clients;
    }

    public get started(): boolean {
        return this._started;
    }
}