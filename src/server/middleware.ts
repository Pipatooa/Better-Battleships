import csurf from 'csurf';
import { NextFunction, Request, Response } from 'express';
import { Forbidden } from 'http-errors';
import { IAuthPayload } from './auth/i-auth-payload';
import { checkRequestAuth } from './auth/request-handler';

const csurfProtection = csurf({ cookie: { sameSite: 'lax', secure: true, httpOnly: true } });

export interface RequestWithAuth extends Request {
    auth: IAuthPayload
}

/**
 * Express middleware function to prevent CSRF attacks
 *
 * Wraps csurf middleware function for custom error messages and async/await support
 *
 * @param  req  Express request to process
 * @param  res  Express response object
 * @param  next Express next function
 */
export async function preventCSRF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        csurfProtection(req, res, next);
    } catch (e: unknown) {
        if (e instanceof Forbidden) {
            res.status(e.status);
            res.send('Invalid CSRF token');
            return;
        }

        throw e;
    }
}

/**
 * Express middleware function to verify login credentials
 *
 * @param  req  Express request to process
 * @param  res  Express response object
 * @param  next Express next function
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {

    // Check authorisation of request
    const payload = await checkRequestAuth(req);

    // If not authorised, redirect user to login page
    if (payload === undefined) {
        const encodedUri = encodeURI(req.baseUrl + req.url);
        res.redirect(`/login?r=${encodedUri}`);
        return;
    }

    // Otherwise, store payload and continue
    (req as RequestWithAuth).auth = payload;
    next();
}
