import WebSocket                         from 'isomorphic-ws';
import { handleServerEvent }             from './server-event-handler';
import type { CloseEvent, MessageEvent } from 'isomorphic-ws';
import type { IClientRequest }           from 'shared/network/requests/i-client-request';

let ws: WebSocket;

/**
 * Opens a websocket connection to the server
 */
export function openSocketConnection(): void {

    // Open a new websocket connection
    ws = new WebSocket(`ws://${window.location.host}${window.location.pathname}`);

    // Register message handler for websocket
    ws.onmessage = handleServerEvent;

    // Register close handler for websocket
    ws.onclose = (e: CloseEvent) => {
        // If connection did not close normally
        if (e.code !== 1000 && e.code !== 1001)
            window.location.href = `/game/notfound${window.location.search}`;
    };
}

/**
 * Sends a request to the server
 *
 * @param  clientRequest Request to send
 */
export function sendRequest(clientRequest: IClientRequest): void {
    ws.send(JSON.stringify(clientRequest));
}
