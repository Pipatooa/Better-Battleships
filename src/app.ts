import express from "express";
import http from "http";
import WebSocket from 'isomorphic-ws';
import cookieParser from 'cookie-parser';
import path from "path";
import exphbs from "express-handlebars";

import gameRouter from './routes/game';
import gameCreateRouter from './routes/game/create';

import socketRegister from './game/server/sockets';

const app = express();
const port : number = 8080;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server, path: "/game" });

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'handlebars');

app.locals.siteName = "Better Battleships";
app.locals.baseUrl = "";

// app.use(express.urlencoded);
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/game', gameRouter);
app.use('/game/create', gameCreateRouter);

socketRegister(wss);

server.listen(port, () => {
    const datetime : Date = new Date();
    console.log(`Started server on port ${port}. The time is ${datetime.toLocaleTimeString()}`);
});
