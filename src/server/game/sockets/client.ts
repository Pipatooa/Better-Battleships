import WebSocket from 'isomorphic-ws';
import {v4} from 'uuid';
import {IAuthPayload} from '../../auth/i-auth-payload';
import {Game} from '../game';
import {Team} from '../scenario/team';

export class Client {
    public readonly id: string;
    public team: Team | undefined;
    public ready: boolean = false;

    public readonly identity: string;

    public constructor(public readonly ws: WebSocket,
                       public readonly authPayload: IAuthPayload,
                       public readonly game: Game) {

        // Generate UUID
        this.id = v4();

        // Create an identity string from auth
        this.identity = `user:${authPayload.username}`;
    }
}
