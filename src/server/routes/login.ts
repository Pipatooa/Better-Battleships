import express from 'express';
import formidable from 'formidable';
import Joi from 'joi';
import { checkPassword } from '../auth/password-hasher';
import { signNewJwtToken } from '../auth/token-handler';
import config from '../config';
import { queryDatabase } from '../db/query';
import { preventCSRF } from '../middleware';

const router = express.Router();

/**
 * GET Route handler for /login
 */
router.get('/', preventCSRF, (req, res) => {

    // Deliver page content
    res.render('login', {
        csrfToken: req.csrfToken(),
        url: req.baseUrl + req.url,
        pageTitle: 'Login',
        pageDescription: '',
        stylesheets: [
            '/css/style.css'
        ],
        scripts: [
            '/js/login.js'
        ]
    });
});

/**
 * POST Route handler for /login
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
        let checkedFields: ILoginFields;
        try {
            checkedFields = await loginFieldSchema.validateAsync(fields);
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

        // Query the database for user
        const query = 'SELECT `password_hash` FROM `user` WHERE `username` = ?';
        const rows = await queryDatabase(query, [ checkedFields.username ]);

        // If user does not exist
        if (rows.length === 0) {
            res.status(400);
            res.send({
                success: false,
                message: 'Username or password incorrect'
            });
            return;
        }

        // If password incorrect
        const hash = rows[0].password_hash;
        if (!await checkPassword(checkedFields.password, hash)) {
            res.status(400);
            res.send({
                success: false,
                message: 'Username or password incorrect'
            });
            return;
        }

        // Sign new JWT
        const token = await signNewJwtToken({
            username: checkedFields.username
        });

        res.status(200);
        res.cookie('user-token', token, {
            sameSite: 'lax',
            secure: true,
            httpOnly: true,
            maxAge: config.authJwtExpiryTimeSeconds
        });
        res.send({
            success: true
        });
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
