import WebSocket from 'isomorphic-ws';
import {v4} from 'uuid';
import {IServerEvent} from '../../../shared/network/events/i-server-event';
import {IAuthPayload} from '../../auth/i-auth-payload';
import {Game} from '../game';
import {Team} from '../scenario/team';

/**
 * Client entity used to keep track of
 */
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

    public sendEvent(serverEvent: IServerEvent) {
        this.ws.send(JSON.stringify(serverEvent));
    }
}
