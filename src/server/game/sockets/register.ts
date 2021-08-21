import * as console from 'console';
import http, {IncomingMessage} from 'http';
import WebSocket, {Data} from 'isomorphic-ws';
import {Socket} from 'net';
import {IAuthPayload} from '../../auth/i-auth-payload';
import {checkRequestAuth} from '../../auth/request-handler';
import {Game} from '../game';
import {queryGame} from '../game-manager';
import {Client} from './client';
import {handleMessage} from './message-handler';

const connectionLimit: number = 64;
let currentConnections: number = 0;

/**
 * Registers handlers for a websocket server
 * @param server HTTP server for upgrade handling
 * @param wss WebSocket server to register handlers for
 */
export default function register(server: http.Server, wss: WebSocket.Server) {

    // Register upgrade handler
    server.on('upgrade', async (req: http.IncomingMessage, socket: Socket, head: Buffer) => {

        // Check connection limit
        if (currentConnections >= connectionLimit) {
            socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
            socket.destroy();
            return;
        }

        // Get game ID from request
        let match = /^\/game\/(.*)/.exec(req.url as string);
        if (match === null) {
            socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
            socket.destroy();
            return;
        }

        // Check if game exists
        let gameID = match[1];
        let game = queryGame(gameID);
        if (game === undefined) {
            socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
            socket.destroy();
            return;
        }

        // Check authorisation
        let payload = await checkRequestAuth(req);

        // If client is not authorised to initiate websocket connection
        if (payload === undefined) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        // Otherwise, continue with upgrade process
        wss.handleUpgrade(req, socket, head, async (ws) => {

            // Create client from websocket, assigning them a uuid
            let client = new Client(ws, payload as IAuthPayload, game as Game);

            // Join client to game
            (game as Game).joinClient(client);

            // Increment connection count
            currentConnections += 1;

            // Send client connection information
            client.sendEvent({
                event: 'connectionInfo',
                identity: client.identity
            });

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
