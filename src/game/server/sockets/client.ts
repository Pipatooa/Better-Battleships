import WebSocket from 'isomorphic-ws';
import {v4} from 'uuid';
import {Game} from '../game';

export class Client {
    public readonly id: string;
    public game: Game | undefined;

    public constructor(public readonly ws: WebSocket) {

        // Generate UUID
        this.id = v4();
    }
}
