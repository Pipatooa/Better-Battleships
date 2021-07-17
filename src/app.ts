import express from "express";
import http from "http";
import WebSocket from 'ws';
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import path from "path";
import exphbs from "express-handlebars";

import gameRouter from './routes/game.js';

const app = express();
const port : number = 8080;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server, path: "/ws" });

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'handlebars');

app.locals.siteName = "Better Battleships";
app.locals.baseUrl = "";

app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/game', gameRouter);

server.listen(port, () => {
    const datetime : Date = new Date();
    console.log(`Started server on port ${port}. The time is ${datetime.toLocaleTimeString()}`);
});
