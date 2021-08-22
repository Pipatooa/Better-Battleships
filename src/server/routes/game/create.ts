import express from 'express';
import formidable, {FileJSON} from 'formidable';
import fs from 'fs';
import {Game} from '../../game/game';
import {capacityReached, createGame} from '../../game/game-manager';
import {Scenario} from '../../game/scenario/scenario';
import {unpack, UnpackingError} from '../../game/scenario/unpacker';
import {preventCSRF, requireAuth} from '../../middleware';

const router = express.Router();

/**
 * GET Route handler for /game/create
 *
 * Requires auth
 */
router.get('/', preventCSRF, requireAuth, (req, res) => {

    // Deliver page content
    res.render('create-game', {
        csrfToken: req.csrfToken(),
        url: req.baseUrl + req.url,
        pageTitle: `Create Game`,
        pageDescription: '',
        stylesheets: [
            '/css/style.css',
            '/css/game.css'
        ],
        scripts: [
            '/js/create-game.js'
        ]
    });
});

/**
 * POST Route handler for /game/create
 *
 * Requires auth
 */
router.post('/', preventCSRF, requireAuth, async (req, res) => {

    // Check if game server is full
    if (capacityReached()) {
        res.status(503);
        res.send({
            success: false,
            message: 'Server full',
            context: 'An error occurred whilst trying to parse the request'
        });
        return;
    }

    let form = formidable({ multiples: true });

    // Parse form data from request
    form.parse(req, async (err, fields, files) => {

        // If error parsing form
        if (err) {
            res.status(400);
            res.send({
                success: false,
                message: 'Could not parse multipart form data',
                context: 'An error occurred whilst trying to parse the request'
            });
            return;
        }

        // If no scenario file was submitted
        if (files.file === undefined) {
            res.status(400);
            res.send({
                success: false,
                message: 'Scenario file was not attached',
                context: 'An error occurred whilst trying to parse the request'
            });
            return;
        }

        const file = files.file as unknown as FileJSON;

        let scenario: Scenario;

        // Process uploaded scenario zip file
        try {
            scenario = await unpack(file);
        } catch (e) {

            // If there was an unpacking error, return a JSON object with details
            if (e instanceof UnpackingError) {
                res.status(400);
                res.send({
                    success: false,
                    message: e.message,
                    context: e.context
                });

                // Cleanup uploaded zip file
                fs.unlinkSync(file.path);
                return;
            }

            // If uploaded scenario was not a zip file
            if (e.message.startsWith('Invalid or unsupported zip format')) {
                res.status(400);
                res.send({
                    success: false,
                    message: e.message,
                    context: 'An error occurred whilst trying to parse the request'
                });
                return;
            }

            // Otherwise, log error
            console.error(e);
            res.status(500);
            res.send({
                success: false,
                message: 'Internal server error',
                context: 'An error occurred whilst trying to parse the request'
            });
            return;
        }

        // Create a new game
        let game: Game = await createGame(scenario);
        res.send({
            success: true,
            gameID: game.gameID,
            debug: JSON.parse(JSON.stringify(scenario))
        });
    });
});

export default router;
