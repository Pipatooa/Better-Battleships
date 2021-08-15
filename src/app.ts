import cookieParser from 'cookie-parser';
import express from 'express';
import exphbs from 'express-handlebars';
import http from 'http';
import WebSocket from 'isomorphic-ws';
import path from 'path';
import * as process from 'process';

import socketRegister from './game/server/sockets/register';

import gameRouter from './routes/game';
import gameCreateRouter from './routes/game/create';

const app = express();
const port: number = 8080;

// Set current working directory to be where this file is located
process.chdir(__dirname);

// Create a http server and an accompanying websocket server located on /game
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server, path: '/game' });

// Express views configuration
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'handlebars');

// Set handlebars variables
app.locals.siteName = 'Better Battleships';
app.locals.baseUrl = 'http://localhost:8080';

// Express middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

// Register route handlers for express
app.use('/game/create', gameCreateRouter);
app.use('/game', gameRouter);

// Register socket handles for the websocket server
socketRegister(wss);

// Start the server
server.listen(port, () => {
    const datetime = new Date();
    console.log(`Started server on port ${port}. The time is ${datetime.toLocaleTimeString()}`);
});
