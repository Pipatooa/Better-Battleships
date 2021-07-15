import express from "express";

const router = express.Router();

router.get('/', (req, res) => {
    res.render('game', {
        url: "/",
        pageTitle: "Game"
    })
});

module.exports = router;