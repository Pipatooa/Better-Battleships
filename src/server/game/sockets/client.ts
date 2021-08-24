import WebSocket from 'isomorphic-ws';
import {v4} from 'uuid';
import {IServerEvent} from '../../../shared/network/events/i-server-event';
import {IAuthPayload} from '../../auth/i-auth-payload';
import {Game} from '../game';
import {Player} from '../scenario/player';
import {Team} from '../scenario/team';

/**
 * Client - Server Version
 *
 * Object to keep track of connected websocket clients
 */
export class Client {

    public readonly id: string;
    public team: Team | undefined;
    public player: Player | undefined;
    public ready: boolean = false;

    public readonly identity: string;

    /**
     * Client constructor
     * @param ws           Websocket which client used to connect
     * @param authPayload  Authorisation payload presented by client on connection
     * @param game         Game which they joined
     */
    public constructor(public readonly ws: WebSocket,
                       public readonly authPayload: IAuthPayload,
                       public readonly game: Game) {

        // Generate UUID
        this.id = v4();

        // Create an identity string from auth
        this.identity = `user:${authPayload.username}`;
    }

    /**
     * Sends an event to the client
     * @param serverEvent Event to send to the client
     */
    public sendEvent(serverEvent: IServerEvent) {
        this.ws.send(JSON.stringify(serverEvent));
    }
}
