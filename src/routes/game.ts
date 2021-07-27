import express from "express";

const router = express.Router();

router.get('/', (req, res) => {
    res.render('game', {
        url: "/",
        pageTitle: "Game",
        pageDescription: "",
        stylesheets: [
            "/css/game.css"
        ],
        scripts: [
            "/js/game.js"
        ]
    })
});

export default router;
