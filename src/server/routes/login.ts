import express from 'express';
import formidable from 'formidable';
import Joi from 'joi';
import {checkPassword} from '../auth/password-hasher';
import {queryDatabase} from '../db/query';

const router = express.Router();

// Route handler for /login
router.get('/', (req, res) => {
    res.render('login', {
        url: req.baseUrl + req.url,
        pageTitle: `Login`,
        pageDescription: '',
        stylesheets: [
            '/css/style.css',
            '/css/login.css'
        ],
        scripts: [
            '/js/login.js'
        ]
    });
});

router.post('/', async (req, res) => {

    const form = formidable({ multiples: true });

    // Parse form data from request
    form.parse(req, async (err, fields, files) => {

        // If error parsing form
        if (err) {
            res.status(400);
            res.send('Invalid form data');
            return;
        }

        // Check form fields against schema
        let checkedFields: ILoginFields;
        try {
            checkedFields = await loginFieldSchema.validateAsync(fields);
        } catch (e) {
            if (e instanceof Joi.ValidationError) {
                res.status(400);
                res.send(e.message);
                return;
            }

            throw e;
        }

        // Query the database for user
        let query = 'SELECT `password_hash` FROM `user` WHERE `username` = ?';
        let rows = await queryDatabase(query, [checkedFields.username]);

        // If user does not exist
        if (rows.length === 0) {
            res.status(400);
            res.send('Username or password incorrect');
            return;
        }

        // If password incorrect
        let hash = rows[0].password_hash;
        if (!await checkPassword(checkedFields.password, hash)) {
            res.status(400);
            res.send('Username or password incorrect');
            return;
        }

        res.sendStatus(200);
    });
});


/**
 * Interface reflecting schema
 */
interface ILoginFields {
    username: string,
    password: string
}

/**
 * Schema for validating form fields
 */
const loginFieldSchema = Joi.object({
    username: Joi.string().min(1).max(32).required(),
    password: Joi.string().min(8).required()
});

export default router;
