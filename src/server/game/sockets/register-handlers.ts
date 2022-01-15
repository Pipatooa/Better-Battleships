import console                      from 'console';
import { checkRequestAuth }         from '../../auth/request-handler';
import config                       from '../../config/config';
import { GamePhase }                from '../game';
import { queryGame }                from '../game-manager';
import { Client }                   from './client';
import { handleRequestFromMessage } from './request-handler';
import type http                    from 'http';
import type { IncomingMessage }     from 'http';
import type WebSocket               from 'isomorphic-ws';
import type { Data }                from 'isomorphic-ws';
import type { Socket }              from 'net';

const connectionLimit = 64;
let currentConnections = 0;

/**
 * Registers handlers for a websocket server
 *
 * @param  server HTTP server for upgrade handling
 * @param  wss    WebSocket server to register handlers for
 */
export function registerWebsocketHandlers(server: http.Server, wss: WebSocket.Server): void {

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

        // Check game finished
        if (game.gamePhase >= GamePhase.Finished) {
            socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
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

        // Check for existing client in game
        const identity = `user:${payload.username}`;
        const client = game.findClient(identity);
        let upgradeHandler: (ws: WebSocket) => void;

        // If game is in lobby stage, and they aren't already connected to the game
        if (client === undefined && game.gamePhase === GamePhase.Lobby)
            upgradeHandler = (ws: WebSocket) => {
                const client = new Client(ws, payload, game);
                client.sendEvent({
                    event: 'connectionInfo',
                    identity: client.identity,
                    reconnectionTimeout: config.gameRejoinTimeout
                });

                game.joinClient(client);
                currentConnections++;

                // Broadcast connection event for connection handler
                wss.emit('connection', ws, req, client);
            };

        // Player reconnecting
        else if (client !== undefined && !client.connected && client.allowReconnection)
            upgradeHandler = (ws: WebSocket) => {
                client.ws = ws;
                client.sendEvent({
                    event: 'connectionInfo',
                    identity: client.identity,
                    reconnectionTimeout: config.gameRejoinTimeout
                });

                game.reconnectClient(client);
                currentConnections++;

                // Broadcast connection event for connection handler
                wss.emit('connection', ws, req, client);
            };

        // Otherwise, destroy connection
        else {
            socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
            socket.destroy();
            return;
        }

        // Update connection
        wss.handleUpgrade(req, socket, head, upgradeHandler);
    });

    // Register connection handler
    wss.on('connection', (ws: WebSocket, req: IncomingMessage, client: Client) => {
        console.log(`Connection from [${req.socket.remoteAddress}]:${req.socket.remotePort} was assigned uuid ${client.id}`);

        // Register handlers
        ws.on('message', async (msg: Data) => {
            await handleRequestFromMessage(client, msg);
        });
        ws.on('close', () => {
            currentConnections--;
        });
    });
}
