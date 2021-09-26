import * as console from 'console';
import express from 'express';
import { queryDatabase } from '../db/query';
import { Game } from '../game/game';
import { queryGame } from '../game/game-manager';
import { RequestWithAuth, requireAuth } from '../middleware';

const router = express.Router();

/**
 * GET Route handler for /game
 *
 * Requires auth
 */
router.get('/:gameID', requireAuth, async (req, res) => {

    // Check game ID
    const gameID: string = req.params.gameID;
    const game: Game | undefined = queryGame(gameID);

    // If game does not exist
    if (game === undefined) {

        // Deliver page content
        res.render('game-not-found', {
            url: req.baseUrl + req.url,
            pageTitle: 'Game does not exist!',
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
    const username = (req as RequestWithAuth).auth.username;

    // Check for existing game session for user
    const query = 'SELECT `current_session` FROM `user` WHERE `username` = ?';
    const rows = await queryDatabase(query, [ username ]);

    // If session exists
    if (rows.length !== 0) {
        console.log(rows);
        // TODO: Session reconnection
    }

    // Deliver page content
    res.render('game', {
        url: req.baseUrl + req.url,
        pageTitle: `Game (${gameID})`,
        pageDescription: '',
        stylesheets: [
            '/css/style.css',
            '/css/game.css'
        ],
        externalScripts: [
            'https://pixijs.download/release/pixi.js'
        ],
        scripts: [
            '/js/game.js'
        ],
        gameUrl: req.baseUrl + req.path
    });
});

export default router;
