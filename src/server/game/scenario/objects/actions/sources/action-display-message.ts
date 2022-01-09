import Joi                        from 'joi';
import { baseActionSchema }       from './base-action';
import type { IBaseActionSource } from './base-action';

/**
 * JSON source interface reflecting schema
 */
export interface IActionDisplayMessage extends IBaseActionSource {
    type: 'displayMessage',
    display: 'message' | 'popup',
    target: 'local:team' | 'local:player' | 'foreign:team' | 'foreign:player',
    message: string
}

/**
 * Schema for validating source JSON data
 */
export const actionDisplayMessageSchema = baseActionSchema.keys({
    type: 'displayMessage',
    display: Joi.valid('message', 'popup').required(),
    target:  Joi.valid('local:team', 'local:player', 'foreign:team', 'foreign:player').required(),
    message: Joi.string().min(1).required()
});
