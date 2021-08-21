import WebSocket, {CloseEvent, MessageEvent, OpenEvent} from 'isomorphic-ws';
import {handleMessage} from './message-handler';

export let socket: WebSocket;

export function openSocketConnection() {
    socket = new WebSocket(`ws://${location.host}${location.pathname}`);

    socket.onopen = (e: OpenEvent) => {
        console.log(`Opened websocket connection to '${e.target.url}'`);
    };

    socket.onmessage = (e: MessageEvent) => {
        console.log(`Message from server: ${e.data}`);
        handleMessage(e);
    };

    socket.onclose = (e: CloseEvent) => {
        console.log(`Closed websocket connection to '${e.target.url}' due to '${e.reason}' (${e.code})`);
    };
}