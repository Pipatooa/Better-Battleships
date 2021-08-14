import express from 'express';
import {Game} from '../game/server/game';
import {queryGame} from '../game/server/game-manager';

const router = express.Router();

// Route handler for /game
router.get('/:gameID', (req, res) => {

    // Check game ID
    let gameID: string = req.params.gameID;
    let game: Game | undefined = queryGame(gameID);

    // If game does not exist
    if (game === undefined) {
        res.render('game-does-not-exist', {
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
