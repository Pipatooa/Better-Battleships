import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { IAuthPayload } from './i-auth-payload';

/**
 * Signs a new JWT with an authorisation payload
 *
 * @param    payload Payload to sign
 * @returns          Signed JWT
 */
export async function signNewJwtToken(payload: IAuthPayload): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(payload, config.authJwtSecretToken, {
            expiresIn: config.authJwtExpiryTimeSeconds
        }, (err, token) => {
            if (err !== null) {
                reject(err);
                return;
            }

            resolve(token!);
        });
    });
}

/**
 * Verifies a signed JWT and extracts the resulting payload
 *
 * @param    token Signed JWT
 * @returns        Signed payload | Undefined if error
 */
export async function verifyToken(token: string): Promise<JwtPayload | undefined> {
    return new Promise<JwtPayload | undefined>((resolve) => {
        jwt.verify(token, config.authJwtSecretToken, (err, payload) => {
            resolve(payload);
        });
    });
}