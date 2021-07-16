import express from "express";

const router = express.Router();

router.get('/', (req, res) => {
    res.render('canvas', {
        url: "/",
        pageTitle: "Canvas",
        stylesheets: [
            "/css/canvas.css"
        ],
        scripts: [
            "/js/canvas/renderer.js"
        ]
    })
});

module.exports = router;