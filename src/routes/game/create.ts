import express from "express";
import formidable, {FileJSON} from 'formidable';
import fs from "fs";
import AdmZip from "adm-zip";

const router = express.Router();

router.post('/', async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.sendStatus(400);
            return;
        }

        if (files.file == undefined) {
            res.sendStatus(400);
            return;
        }

        const file = files.file as unknown as FileJSON;

        try {
            const zip = new AdmZip(file.path);
            const zipEntries = zip.getEntries();

            zipEntries.forEach((zipEntry) => {
                zipEntry.getDataAsync((data) => {
                    console.log(zipEntry.entryName, data.toString());
                })
            });

            console.log(zip.getEntry('scenario.json')?.toString());
        }
        catch (e) {
            res.sendStatus(400);
            fs.unlinkSync(file.path);
            return;
        }

        res.sendStatus(200);
    });
});

export default router;
