import http                          from 'http';
import path                          from 'path';
import process                       from 'process';
import cookieParser                  from 'cookie-parser';
import express                       from 'express';
import exphbs                        from 'express-handlebars';
import WebSocket                     from 'isomorphic-ws';
import config                        from './config/config';
import { executeDBStartupScript }    from './db/startup';
import { findAvailableIcons }        from './game/scenario/objects/abilities/icons';
import { registerWebsocketHandlers } from './game/sockets/register-handlers';

// Routers
import gameRouter         from './routes/game';
import gameCreateRouter   from './routes/game/create';
import gameNotFoundRouter from './routes/game/notfound';
import indexRouter        from './routes/index';
import loginRouter        from './routes/login';
import registerRouter     from './routes/register';

const app = express();
const port = config.port;

// Set current working directory to be where this file is located
process.chdir(__dirname);

// Execute database startup script
executeDBStartupScript().then(() => {

    // Find icons for use in scenarios
    findAvailableIcons();

    // Create a http server and an accompanying websocket server
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ noServer: true });

    // Express views configuration
    app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
    app.set('views', path.join(process.cwd(), 'views'));
    app.set('view engine', 'handlebars');

    // Set handlebars variables
    app.locals.siteName = 'Better Battleships';
    app.locals.baseUrl = 'http://localhost:8080';

    // Express middleware setup
    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use(cookieParser());

    // Register route handlers for express
    app.use('/', indexRouter);
    app.use('/game/create', gameCreateRouter);
    app.use('/game/notfound', gameNotFoundRouter);
    app.use('/game', gameRouter);
    app.use('/login', loginRouter);
    app.use('/register', registerRouter);

    // Register socket handles for the websocket server
    registerWebsocketHandlers(server, wss);

    // Start the server
    server.listen(port, () => {
        const datetime = new Date();
        console.log(`Started server on port ${port}. The time is ${datetime.toLocaleTimeString()}`);
    });
});
