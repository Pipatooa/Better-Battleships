import express from 'express';

const router = express.Router();

// Route handler for /game
router.get('/', (req, res) => {
    res.render('game', {
        url: '/',
        pageTitle: 'Game',
        pageDescription: '',
        stylesheets: [
            '/css/game.css'
        ],
        scripts: [
            '/js/game.js'
        ]
    });
});

export default router;
