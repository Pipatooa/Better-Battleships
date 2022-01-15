import http                          from 'http';
import path                          from 'path';
import process                       from 'process';
import cookieParser                  from 'cookie-parser';
import express                       from 'express';
import { engine }                    from 'express-handlebars';
import WebSocket                     from 'isomorphic-ws';
import config                        from './config/config';
import { executeDBStartupScript }    from './db/startup';
import { findAvailableScenarios }    from './game/scenario/builtin-scenarios';
import { findAvailableIcons }        from './game/scenario/objects/abilities/icons';
import { registerWebsocketHandlers } from './game/sockets/register-handlers';
import gameRouter                    from './routes/game';
import gameCreateRouter              from './routes/game/create';
import gameNotFoundRouter            from './routes/game/notfound';
import indexRouter                   from './routes/index';
import loginRouter                   from './routes/login';
import registerRouter                from './routes/register';
import scenariosListRouter           from './routes/scenarios/list';
import statsRouter                   from './routes/stats';
import statsApiGamesRouter           from './routes/stats/api/games';

// Create express app
const app = express();

// Set current working directory to be where this file is located
process.chdir(__dirname);

// Execute database startup script
executeDBStartupScript().then(async () => {

    // Find scenario data
    await findAvailableScenarios();
    findAvailableIcons();

    // Create a http server and an accompanying websocket server
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ noServer: true });

    // Express views configuration
    app.engine('handlebars', engine({ defaultLayout: 'main' }));
    app.set('views', path.join(process.cwd(), 'views'));
    app.set('view engine', 'handlebars');

    // Set handlebars variables
    app.locals.siteName = config.siteName;
    app.locals.baseUrl = config.baseUrl;

    // Express middleware setup
    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use(cookieParser());

    // Main route handlers
    app.use('/', indexRouter);
    app.use('/game/create', gameCreateRouter);
    app.use('/game/notfound', gameNotFoundRouter);
    app.use('/game', gameRouter);
    app.use('/scenarios/list', scenariosListRouter);

    // Login route handlers
    app.use('/login', loginRouter);
    app.use('/register', registerRouter);

    // Stats API route handlers
    app.use('/stats/api/games', statsApiGamesRouter);

    // Stats page route handlers
    app.use('/stats', statsRouter);

    // Register socket handles for the websocket server
    registerWebsocketHandlers(server, wss);

    // Start the server
    if (config.port === -1)
        server.listen(config.host, () => {
            const datetime = new Date();
            console.log(`Started server on '${config.host}'. The time is ${datetime.toLocaleTimeString()}`);
        });
    else
        server.listen(config.port, config.host, () => {
            const datetime = new Date();
            console.log(`Started server on '${config.host}:${config.port}'. The time is ${datetime.toLocaleTimeString()}`);
        });
});
