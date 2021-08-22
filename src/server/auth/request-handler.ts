import cookie from 'cookie';
import {IAuthPayload} from './i-auth-payload';
import {verifyToken} from './token-handler';

/**
 * Checks the authorisation of a request
 * @param req
 * @returns payload -- Payload | Undefined if error
 */
export async function checkRequestAuth(req: any): Promise<IAuthPayload | undefined> {

    let token: string;

    // Extract auth token from cookies
    if ('cookies' in req)
        token = req.cookies['user-token'];
    else
        token = cookie.parse(req.headers.cookie)['user-token'];

    // If no authorisation token was provided
    if (token === undefined)
        return undefined;

    // Verify token and extract payload
    return await verifyToken(token) as unknown as IAuthPayload | undefined;
}