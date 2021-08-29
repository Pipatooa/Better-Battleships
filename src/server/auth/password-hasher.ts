import bcrypt from 'bcryptjs';
import config from '../config';

/**
 * Returns a generated hash for a password
 *
 * @param    password Plain password
 * @returns           Hash to store
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(config.authHashRounds);
    return await bcrypt.hash(password, salt);
}

/**
 * Checks whether a password matches a generated hash
 *
 * @param    password Plain password to check
 * @param    hash     Stored password hash
 * @returns           Whether password matched hash
 */
export async function checkPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

/**
 * Checks whether a password hash needs updating to be more secure
 *
 * @param    hash Stored password hash
 * @returns       Whether hash needs updating
 */
export async function checkPasswordNeedsUpdate(hash: string): Promise<boolean> {
    return bcrypt.getRounds(hash) < config.authHashRounds;
}
