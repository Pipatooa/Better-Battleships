import AdmZip from 'adm-zip';
import express from 'express';
import formidable, {FileJSON} from 'formidable';
import fs from 'fs';
import {unpack, UnpackingError} from '../../game/server/scenario/unpacker';

const router = express.Router();

// Route handler for /game/create
router.post('/', async (req, res) => {
    const form = formidable({ multiples: true });

    // Parse form data from request
    form.parse(req, async (err, fields, files) => {

        // If error parsing form
        if (err) {
            res.sendStatus(400);
            return;
        }

        // If no scenario file was submitted
        if (files.file == undefined) {
            res.sendStatus(400);
            return;
        }

        const file = files.file as unknown as FileJSON;

        // Process uploaded scenario zip file
        try {
            const zip = new AdmZip(file.path);
            let res = await unpack(zip);
            console.log(0, res);
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

            // Otherwise rethrow error
            throw e;
        }

        res.sendStatus(200);
    });
});

export default router;
