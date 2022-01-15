import { TimeoutManager }    from 'shared/timeout-manager';
import { v4 }                from 'uuid';
import config                from '../../config/config';
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

    public readonly timeoutManager = new TimeoutManager<'reconnection'>({
        reconnection: [() => this.inactive = true, config.gameRejoinTimeout, false]
    });

    public readonly id: string;
    public readonly username: string;
    public readonly identity: string;

    public player: Player | undefined;
    public team: Team | undefined;
    public ready = false;
    public shipsPlaced = false;

    public connected = true;
    public inactive = false;
    public allowReconnection = false;

    /**
     * Client constructor
     *
     * @param  _ws         Websocket which client used to connect
     * @param  authPayload Authorisation payload presented by client on connection
     * @param  game        Game which they joined
     */
    public constructor(private _ws: WebSocket,
                       private readonly authPayload: IAuthPayload,
                       public readonly game: Game) {

        // Generate UUID
        this.id = v4();

        // Create an identity string from auth
        this.username = authPayload.username;
        this.identity = `user:${this.username}`;
    }

    /**
     * Sends an event to the client
     *
     * @param  serverEvent Event to send to the client
     */
    public sendEvent(serverEvent: ServerEvent): void {
        this.ws.send(JSON.stringify(serverEvent));
    }

    /**
     * Getters and setters
     */

    public get ws(): WebSocket {
        return this._ws;
    }

    public set ws(ws: WebSocket) {
        this._ws.close(1000);
        this._ws = ws;
    }
}
