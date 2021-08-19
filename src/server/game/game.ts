import * as console from 'console';
import config from '../config';
import {Scenario} from './scenario/scenario';
import {Client} from './sockets/client';

export class Game {
    protected timeoutID: NodeJS.Timeout | undefined;
    protected _clients: Client[] = [];

    public constructor(public readonly id: string,
                       public readonly scenario: Scenario,
                       protected readonly timeoutFunction: (gameID: string) => void) {

        this.startTimeout(config.gameJoinTimeout);
    }

    public joinClient(client: Client) {

        // Debug
        console.log(`Client ${client.id} joined game ${this.id}`);

        // Stop game timeout
        this.stopTimeout();

        // Add client to list of clients
        this._clients.push(client);

        // When client disconnects, remove them from list of clients
        client.ws.on('close', () => {
            this._clients = this._clients.filter(c => c !== client);

            // Debug
            console.log(`Client ${client.id} disconnected from game ${this.id}`);

            // Broadcast disconnect event to existing clients
            for (let existingClient of this._clients) {
                existingClient.ws.send(JSON.stringify({
                    dataType: 'playerLeave',
                    playerID: client.id
                }));
            }

            // If no clients are connected to this game, start a game timeout
            if (this._clients.length === 0)
                this.startTimeout(config.gameJoinTimeout);
        });

        // Send client information about the scenario
        client.ws.send(JSON.stringify({
            dataType: 'gameInfo',
            scenario: this.scenario.makeTransportable()
        }));

        // Broadcast player join to all existing clients
        for (let existingClient of this._clients) {
            existingClient.ws.send(JSON.stringify({
                dataType: 'playerJoin',
                playerID: client.id,
                team: client.team?.id,
                ready: client.ready
            }));

            // Broadcast existing client information to new client
            if (existingClient !== client) {
                client.ws.send(JSON.stringify({
                    dataType: 'playerJoin',
                    playerID: existingClient.id,
                    team: existingClient.team?.id,
                    ready: client.ready
                }));
            }
        }

        // Assign this game to the client
        client.game = this;
    }

    public startTimeout(duration: number) {
        if (this.timeoutID !== undefined)
            this.stopTimeout();

        this.timeoutID = setTimeout(() => this.timeoutFunction(this.id), duration);
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
}