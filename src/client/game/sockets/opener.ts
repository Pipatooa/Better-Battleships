import WebSocket, { CloseEvent, MessageEvent, OpenEvent } from 'isomorphic-ws';
import { IClientRequest } from '../../../shared/network/requests/i-client-request';
import { handleMessage } from './message-handler';

let ws: WebSocket;

/**
 * Opens a websocket connection to the server
 */
export function openSocketConnection(): void {

    // Open a new websocket connection
    ws = new WebSocket(`ws://${window.location.host}${window.location.pathname}`);

    // Register open handler for websocket
    ws.onopen = (e: OpenEvent) => {
        console.log(`Opened websocket connection to '${e.target.url}'`);
    };

    // Register message handler for websocket
    ws.onmessage = (e: MessageEvent) => {
        console.log(`Message from server: ${e.data}`);
        handleMessage(e);
    };

    // Register close handler for websocket
    ws.onclose = (e: CloseEvent) => {
        console.log(`Closed websocket connection to '${e.target.url}' due to '${e.reason}' (${e.code})`);

        // If connection did not close due to them leaving the page
        if (e.code !== 1001)
            window.location.href = `/game/notfound${window.location.search}`;
    };
}

/**
 * Sends a request to the server
 *
 * @param  clientRequest Request to send
 */
export function sendRequest(clientRequest: IClientRequest): void {

    // Convert request to JSON and send to server
    ws.send(JSON.stringify(clientRequest));
}
