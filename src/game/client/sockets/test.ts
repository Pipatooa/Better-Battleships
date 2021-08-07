import WebSocket, {CloseEvent, MessageEvent, OpenEvent} from 'isomorphic-ws';

let socket = new WebSocket(`ws://${location.hostname}:8080/game`);
let a: OpenEvent | null = null;

socket.onopen = (e: OpenEvent) => {
    console.log(`Opened websocket connection to ${e.target.url}`);
    a = e;
};

socket.onmessage = (e: MessageEvent) => {
    console.log(`Message from server ${e.data}`);
};

socket.onclose = (e: CloseEvent) => {
    console.log(`Closed websocket connection to ${e.target.url} due to ${e.reason} (${e.code})`);
};

export default a;
