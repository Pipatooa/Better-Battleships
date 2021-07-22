import express from "express";

const router = express.Router();

router.get('/', (req, res) => {
    res.render('game', {
        url: "/",
        pageTitle: "Game",
        stylesheets: [
            "/css/game.css"
        ],
        scripts: [
            // "/js/game/canvas/oldRenderer.js",
            "/js/game/grid.js",
            "/js/game/game.js"
        ]
    })
});

export default router;
