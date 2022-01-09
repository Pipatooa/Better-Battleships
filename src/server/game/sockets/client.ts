import { v4 }                from 'uuid';
import type { IAuthPayload } from '../../auth/i-auth-payload';
import type { Game }         from '../game';
import type { Player }       from '../scenario/objects/player';
import type { Team }         from '../scenario/objects/team';
import type WebSocket        from 'isomorphic-ws';
import type { ServerEvent }  from 'shared/network/events/server-event';

/**
 * Client - Server Version
 *
 * Object to keep track of connected websocket clients
 */
export class Client {

    public readonly id: string;
    public player: Player | undefined;
    public team: Team | undefined;
    public ready = false;
    public shipsPlaced = false;

    public readonly identity: string;

    /**
     * Client constructor
     *
     * @param  ws          Websocket which client used to connect
     * @param  authPayload Authorisation payload presented by client on connection
     * @param  game        Game which they joined
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
     *
     * @param  serverEvent Event to send to the client
     */
    public sendEvent(serverEvent: ServerEvent): void {
        this.ws.send(JSON.stringify(serverEvent));
    }
}
