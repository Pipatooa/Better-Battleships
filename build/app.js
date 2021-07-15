"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var WebSocket = __importStar(require("ws"));
var body_parser_1 = __importDefault(require("body-parser"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var path_1 = __importDefault(require("path"));
var express_handlebars_1 = __importDefault(require("express-handlebars"));
var gameRouter = require('./routes/game');
var app = express_1.default();
var port = 8080;
var server = http_1.default.createServer(app);
var wss = new WebSocket.Server({ server: server, path: "/ws" });
app.engine('handlebars', express_handlebars_1.default({ defaultLayout: 'main' }));
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.locals.siteName = "Better Battleships";
app.locals.baseUrl = "";
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/game', gameRouter);
server.listen(port, function () {
    var datetime = new Date();
    console.log("Started server on port " + port + ". The time is " + datetime.toLocaleTimeString());
});
