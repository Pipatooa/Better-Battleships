import WebSocket, {Data} from "isomorphic-ws";

/**
 * Registers handlers for a websocket server
 * @param wss Websocket server to register handlers for
 */
function register(wss: WebSocket.Server) {

    // On connection handler
    wss.on("connection", (ws: WebSocket, req) => {

        // Debug
        console.log(`New connection to ${req.socket.remoteAddress} on port ${req.socket.remotePort}`)
        ws.send("Hello");

        // On message handler
        ws.on("message", (msg: Data) => {
            console.log(`Message received: ${msg}`);
        })
    });
}

export default register;
