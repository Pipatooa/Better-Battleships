import express from 'express';
import formidable from 'formidable';
import Joi from 'joi';
import {hashPassword} from '../auth/password-hasher';
import {queryDatabase} from '../db/query';

const router = express.Router();

// Route handler for /register
router.get('/', (req, res) => {
    res.render('register', {
        url: req.baseUrl + req.url,
        pageTitle: `Register`,
        pageDescription: '',
        stylesheets: [
            '/css/style.css',
            '/css/register.css'
        ],
        scripts: [
            '/js/register.js'
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
        let checkedFields: IRegisterFields;
        try {
            checkedFields = await registerFieldSchema.validateAsync(fields);
        } catch (e) {
            if (e instanceof Joi.ValidationError) {
                res.status(400);
                res.send(e.message);
                return;
            }

            throw e;
        }

        // Query the database to check if user already exists
        let query = 'SELECT 1 FROM `user` WHERE `username` = ?';
        let rows = await queryDatabase(query, [checkedFields.username]);

        // If username is already taken
        if (rows.length !== 0) {
            res.status(400);
            res.send({ message: 'Username taken' });
            return;
        }

         // Get password hash for user and store to database
        let hash = await hashPassword(checkedFields.password);
        query = 'INSERT INTO `user` VALUES (?, ?)';
        await queryDatabase(query, [checkedFields.username, hash]);

        res.sendStatus(200);
    });
});

/**
 * Interface reflecting schema
 */
interface IRegisterFields {
    username: string,
    password: string,
    password2: string
}

/**
 * Schema for validating form fields
 */
const registerFieldSchema = Joi.object({
    username: Joi.string().min(1).max(32).required(),
    password: Joi.string().min(8).required(),
    password2: Joi.valid(Joi.ref('password')).required()
});

export default router;
