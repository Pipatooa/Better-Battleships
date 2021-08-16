import WebSocket from 'isomorphic-ws';
import {v4} from 'uuid';
import {Game} from '../game';
import {Team} from '../scenario/team';

export class Client {
    public readonly id: string;
    public game: Game | undefined;
    public team: Team | undefined;
    public ready: boolean = false;

    public constructor(public readonly ws: WebSocket) {

        // Generate UUID
        this.id = v4();
    }
}
