import * as console from 'console';
import {gameJoinTimeout} from './game-manager';
import {Scenario} from './scenario/scenario';
import {Client} from './sockets/client';

export class Game {
    protected timeoutID: NodeJS.Timeout | undefined;
    protected clients: Client[] = [];

    public constructor(public readonly id: string,
                       public readonly scenario: Scenario,
                       protected readonly timeoutFunction: (gameID: string) => void) {

        this.startTimeout(gameJoinTimeout);
    }

    public joinClient(client: Client) {

        // Debug
        console.log(`Client ${client.id} joined game ${this.id}`);

        // Stop game timeout
        this.stopTimeout();

        // Add client to list of clients
        this.clients.push(client);

        // When client disconnects, remove them from list of clients
        client.ws.on('close', () => {
            this.clients = this.clients.filter(c => c !== client);

            // Debug
            console.log(`Client ${client.id} disconnected from game ${this.id}`);

            // If no clients are connected to this game, start a game timeout
            if (this.clients.length === 0)
                this.startTimeout(gameJoinTimeout);
        });
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
}