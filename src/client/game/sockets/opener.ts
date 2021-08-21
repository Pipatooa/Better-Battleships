import WebSocket, {CloseEvent, MessageEvent, OpenEvent} from 'isomorphic-ws';
import {IClientRequest} from '../../../shared/network/requests/i-client-request';
import {handleMessage} from './message-handler';

let ws: WebSocket;

export function openSocketConnection() {
    ws = new WebSocket(`ws://${location.host}${location.pathname}`);

    ws.onopen = (e: OpenEvent) => {
        console.log(`Opened websocket connection to '${e.target.url}'`);
    };

    ws.onmessage = (e: MessageEvent) => {
        console.log(`Message from server: ${e.data}`);
        handleMessage(e);
    };

    ws.onclose = (e: CloseEvent) => {
        console.log(`Closed websocket connection to '${e.target.url}' due to '${e.reason}' (${e.code})`);
    };
}

export function sendRequest(clientRequest: IClientRequest) {
    ws.send(JSON.stringify(clientRequest));
}
