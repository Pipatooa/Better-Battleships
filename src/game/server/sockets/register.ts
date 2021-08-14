import * as console from 'console';
import {IncomingMessage} from 'http';
import WebSocket, {Data} from 'isomorphic-ws';
import {Client} from './client';
import {handleMessage} from './message-handler';

const connectionLimit: number = 64;
let currentConnections: number = 0;

/**
 * Registers handlers for a websocket server
 * @param wss Websocket server to register handlers for
 */
export default function register(wss: WebSocket.Server): void {

    // Register connection handler
    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {

        // Check connection limit
        if (currentConnections >= connectionLimit) {
            ws.close(503, 'Server full');
            return;
        }

        currentConnections += 1;

        // Create client from websocket, assigning them a uuid
        let client = new Client(ws);

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
