import express from "express";
import {walkDir} from "../walkdir";

const router = express.Router();

let scripts = walkDir("public/js/game");
scripts = scripts.map(e => e.slice(6));

router.get('/', (req, res) => {
    res.render('game', {
        url: "/",
        pageTitle: "Game",
        stylesheets: [
            "/css/game.css"
        ],
        scripts: scripts
    })
});

module.exports = router;