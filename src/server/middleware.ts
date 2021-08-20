import csurf from 'csurf';
import {Forbidden} from 'http-errors';
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

    // Extract auth token from cookies
    let token: string = req.cookies['user-token'];

    // If no authorisation token was provided, redirect user to login page
    if (token === undefined) {
        res.redirect(`/login?r=${req.baseUrl + req.url}`);
        return;
    }

    // Verify token and extract payload
    let payload = await verifyToken(token);

    // If token was invalid, redirect user to login page
    if (payload === undefined) {
        res.redirect(`/login?r=${req.baseUrl + req.url}`);
        return;
    }

    // Otherwise, store payload and continue
    req.auth = payload;
    next();
}
