import WebSocket                                    from 'isomorphic-ws';
import { handleServerEvent }                        from './server-event-handler';
import type { CloseEvent, MessageEvent, OpenEvent } from 'isomorphic-ws';
import type { IClientRequest }                      from 'shared/network/requests/i-client-request';

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
        handleServerEvent(e);
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
    const msg = JSON.stringify(clientRequest);
    console.log(`Sending to server: ${msg}`);
    ws.send(msg);
}
