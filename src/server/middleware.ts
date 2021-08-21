import csurf from 'csurf';
import {IncomingMessage, OutgoingHttpHeaders } from 'http';
import {Forbidden} from 'http-errors';
import {checkRequestAuth} from './auth/request-handler';
import {verifyToken} from './auth/token-handler';

let csurfProtection = csurf({ cookie: { sameSite: 'lax', secure: true, httpOnly: true } });

/**
 * Middleware function to prevent CSRF attacks
 * @param req
 * @param res
 * @param next
 */
export async function preventCSRF(req: any, res: any, next: any) {
    try {
        csurfProtection(req, res, next);
    } catch (e) {
        if (e instanceof Forbidden) {
            res.status(e.status);
            res.message('Invalid CSRF token');
            return;
        }

        throw e;
    }
}

/**
 * Middleware function to verify login credentials
 * @param req
 * @param res
 * @param next
 */
export async function requireAuth(req: any, res: any, next: any) {

    // Check authorisation of request
    let payload = await checkRequestAuth(req);

    // If not authorised, redirect user to login page
    if (payload === undefined) {
        res.redirect(`/login?r=${req.baseUrl + req.url}`);
        return;
    }

    // Otherwise, store payload and continue
    req.auth = payload;
    next();
}
