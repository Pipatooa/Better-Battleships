import cookie from 'cookie';
import type { Request } from 'express';
import type { IAuthPayload } from './i-auth-payload';
import { verifyToken } from './token-handler';
import type http from 'http';

/**
 * Checks the authorisation of a request
 *
 * @param    req Express request or raw http request to check
 * @returns      Payload | Undefined if error
 */
export async function checkRequestAuth(req: Request | http.IncomingMessage): Promise<IAuthPayload | undefined> {

    let token: string;

    // Extract auth token from cookies
    if ('cookies' in req)
        token = req.cookies['user-token'];
    else {
        const cookieString = req.headers.cookie;
        if (cookieString === undefined)
            return undefined;

        token = cookie.parse(cookieString)['user-token'];
    }

    // If no authorisation token was provided
    if (token === undefined)
        return undefined;

    // Verify token and extract payload
    return await verifyToken(token) as unknown as IAuthPayload | undefined;
}
