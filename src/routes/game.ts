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
            "/js/game/canvas/renderer.js",
            "/js/game/grid.js"
        ]
    })
});

export default router;
