import WebSocket, {Data} from "isomorphic-ws";


function register(wss: WebSocket.Server) {
    wss.on("connection", (ws: WebSocket, req) => {
        console.log(`New connection to ${req.socket.remoteAddress} on port ${req.socket.remotePort}`)
        ws.send("Hello");

        ws.on("message", (msg: Data) => {
            console.log(`Message received: ${msg}`);
        })
    });
}

export default register;
