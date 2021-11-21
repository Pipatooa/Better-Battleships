import console                  from 'console';
import { checkRequestAuth }     from '../../auth/request-handler';
import { GamePhase }            from '../game';
import { queryGame }            from '../game-manager';
import { Client }               from './client';
import { handleMessage }        from './message-handler';
import type http                from 'http';
import type { IncomingMessage } from 'http';
import type WebSocket           from 'isomorphic-ws';
import type { Data }            from 'isomorphic-ws';
import type { Socket }          from 'net';

const connectionLimit = 64;
let currentConnections = 0;

/**
 * Registers handlers for a websocket server
 *
 * @param  server HTTP server for upgrade handling
 * @param  wss    WebSocket server to register handlers for
 */
export default function register(server: http.Server, wss: WebSocket.Server): void {

    // Register upgrade handler
    server.on('upgrade', async (req: http.IncomingMessage, socket: Socket, head: Buffer) => {

        // Check connection limit
        if (currentConnections >= connectionLimit) {
            socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
            socket.destroy();
            return;
        }

        // Get game ID from request
        const match = /^\/game\/(.*)/.exec(req.url!);
        if (match === null) {
            socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
            socket.destroy();
            return;
        }

        // Check if game exists
        const gameID = match[1];
        const game = queryGame(gameID);
        if (game === undefined) {
            socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
            socket.destroy();
            return;
        }

        // Check authorisation
        const payload = await checkRequestAuth(req);

        // If client is not authorised to initiate websocket connection
        if (payload === undefined) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        // Check if game has already started
        if (game.gamePhase !== GamePhase.Lobby) {
            socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
            socket.destroy();
            return;
        }

        // Otherwise, continue with upgrade process
        wss.handleUpgrade(req, socket, head, async (ws) => {

            // Create client from websocket, assigning them a uuid
            const client = new Client(ws, payload, game);

            // Send client connection information
            client.sendEvent({
                event: 'connectionInfo',
                identity: client.identity
            });

            // Join client to game
            game.joinClient(client);

            // Increment connection count
            currentConnections += 1;

            // Broadcast connection event for connection handler
            wss.emit('connection', ws, req, client);
        });
    });

    // Register connection handler
    wss.on('connection', (ws: WebSocket, req: IncomingMessage, client: Client) => {

        // Debug
        console.log(`Connection from [${req.socket.remoteAddress}]:${req.socket.remotePort} was assigned uuid ${client.id}`);

        // Register handlers
        ws.on('message', async (msg: Data) => {
            await handleMessage(client, msg);
        });
        ws.on('close', () => {
            currentConnections -= 1;
        });
    });
}
