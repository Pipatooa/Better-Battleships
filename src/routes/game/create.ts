import AdmZip from 'adm-zip';
import express from 'express';
import formidable, {FileJSON} from 'formidable';
import fs from 'fs';
import {Game} from '../../game/server/game';
import {capacityReached, createGame} from '../../game/server/game-manager';
import {Scenario} from '../../game/server/scenario/scenario';
import {unpack, UnpackingError} from '../../game/server/scenario/unpacker';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('create-game', {
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

// Route handler for /game/create
router.post('/', async (req, res) => {

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

    const form = formidable({ multiples: true });

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
            const zip = new AdmZip(file.path);
            scenario = await unpack(zip);
        } catch (e) {

            // If there was an unpacking error, return a JSON object with details
            if (e instanceof UnpackingError) {
                // throw e;
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

            // Otherwise rethrow error
            throw e;
        }

        // Create a new game
        let game: Game = createGame(scenario);
        res.send({
            success: true,
            gameID: game.id,
            debug: JSON.parse(JSON.stringify(scenario))
        });
    });
});

export default router;
