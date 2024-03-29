import express           from 'express';
import formidable        from 'formidable';
import Joi               from 'joi';
import { hashPassword }  from '../auth/password-hasher';
import { queryDatabase } from '../db/query';
import { preventCSRF }   from '../middleware';

const router = express.Router();
export default router;

/**
 * GET Route handler for /register
 */
router.get('/', preventCSRF, (req, res) => {

    // Deliver page content
    res.render('register', {
        csrfToken: req.csrfToken(),
        url: req.baseUrl + req.url,
        pageTitle: 'Register',
        pageDescription: '',
        stylesheets: [
            '/css/style.css'
        ],
        scripts: [
            '/js/register.js'
        ]
    });
});

/**
 * POST Route handler for /register
 */
router.post('/', preventCSRF, async (req, res) => {

    const form = formidable({ multiples: true });

    // Parse form data from request
    form.parse(req, async (err, fields) => {

        // If error parsing form
        if (err !== null) {
            res.status(400);
            res.send({
                success: false,
                message: 'Invalid form data'
            });
            return;
        }

        // Check form fields against schema
        let checkedFields: IRegisterFields;
        try {
            checkedFields = await registerFieldSchema.validateAsync(fields);
        } catch (e: unknown) {
            if (e instanceof Joi.ValidationError) {
                res.status(400);
                res.send({
                    success: false,
                    message: e.message
                });
                return;
            }

            throw e;
        }

        // Query the database to check if user already exists
        let query = 'SELECT 1 FROM `user` WHERE `username` = ?';
        const rows = await queryDatabase(query, [ checkedFields.username ]);

        // If username is already taken
        if (rows.length !== 0) {
            res.status(400);
            res.send({
                success: false,
                message: 'Username taken'
            });
            return;
        }

        // Get password hash for user and store to database
        const hash = await hashPassword(checkedFields.password);
        query = 'INSERT INTO `user` (`username`, `password_hash`) VALUES (?, ?)';
        await queryDatabase(query, [ checkedFields.username, hash ]);

        res.status(200);
        res.send({
            success: true
        });
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
    username: Joi.string().min(3).max(32).regex(/^[a-zA-Z\-_\d.]+$/).required(),
    password: Joi.string().min(8).regex(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[ -/:-@[-`{-~]).+$/).required(),
    password2: Joi.valid(Joi.ref('password')).required()
});
