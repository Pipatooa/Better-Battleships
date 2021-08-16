import WebSocket, {CloseEvent, MessageEvent, OpenEvent} from 'isomorphic-ws';
import {handleMessage} from './message-handler';

export let socket: WebSocket;
const gameID: string = window.location.pathname.split('/')[2];

export function openSocketConnection() {
    socket = new WebSocket(`ws://${location.host}/game`);

    socket.onopen = (e: OpenEvent) => {
        console.log(`Opened websocket connection to '${e.target.url}'`);

        // Send request to join server
        socket.send(JSON.stringify({
            request: 'join',
            gameID: gameID
        }));
    };

    socket.onmessage = (e: MessageEvent) => {
        console.log(`Message from server: ${e.data}`);
        handleMessage(e);
    };

    socket.onclose = (e: CloseEvent) => {
        console.log(`Closed websocket connection to '${e.target.url}' due to '${e.reason}' (${e.code})`);
    };
}