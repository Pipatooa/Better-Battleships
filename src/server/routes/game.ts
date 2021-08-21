import * as console from 'console';
import express from 'express';
import {queryDatabase} from '../db/query';
import {Game} from '../game/game';
import {queryGame} from '../game/game-manager';
import {requireAuth} from '../middleware';

const router = express.Router();

// Route handler for /game
router.get('/:gameID', requireAuth, async (req, res) => {

    // Check game ID
    let gameID: string = req.params.gameID;
    let game: Game | undefined = queryGame(gameID);

    // If game does not exist
    if (game === undefined) {
        res.render('game-not-found', {
            url: req.baseUrl + req.url,
            pageTitle: `Game does not exist!`,
            pageDescription: '',
            stylesheets: [
                '/css/style.css',
                '/css/game.css'
            ],
            scripts: [],
            gameID: gameID
        });
        return;
    }

    // Get username for user
    let username = (req as any).auth.username;

    // Check for existing game session for user
    let query = 'SELECT `current_session` FROM `user` WHERE `username` = ?';
    let rows = await queryDatabase(query, [username]);

    // If session exists
    if (rows.length !== 0) {
        console.log(rows);
    }

    res.render('game', {
        url: req.baseUrl + req.url,
        pageTitle: `Game (${gameID})`,
        pageDescription: '',
        stylesheets: [
            '/css/style.css',
            '/css/game.css'
        ],
        scripts: [
            '/js/game.js'
        ],
        gameUrl: req.baseUrl + req.url
    });
});

export default router;
