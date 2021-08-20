import express from 'express';
import formidable from 'formidable';
import Joi from 'joi';
import {checkPassword} from '../auth/password-hasher';
import {signNewJwtToken} from '../auth/token-handler';
import config from '../config';
import {queryDatabase} from '../db/query';
import {preventCSRF} from '../middleware';

const router = express.Router();

// Route handler for /login
router.get('/', preventCSRF, (req, res) => {
    res.render('login', {
        csrfToken: req.csrfToken(),
        url: req.baseUrl + req.url,
        pageTitle: `Login`,
        pageDescription: '',
        stylesheets: [
            '/css/style.css'
        ],
        scripts: [
            '/js/login.js'
        ]
    });
});

router.post('/', preventCSRF, async (req, res) => {

    let form = formidable({ multiples: true });

    // Parse form data from request
    form.parse(req, async (err, fields, files) => {

        // If error parsing form
        if (err) {
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
        } catch (e) {
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
        let query = 'SELECT `password_hash` FROM `user` WHERE `username` = ?';
        let rows = await queryDatabase(query, [checkedFields.username]);

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
        let hash = rows[0].password_hash;
        if (!await checkPassword(checkedFields.password, hash)) {
            res.status(400);
            res.send({
                success: false,
                message: 'Username or password incorrect'
            });
            return;
        }

        // Sign new JWT
        let token = await signNewJwtToken({
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
