import Joi                        from 'joi';
import { baseActionSchema }       from './base-action';
import type { IBaseActionSource } from './base-action';

/**
 * JSON source interface reflecting schema
 */
export interface IActionLoseSource extends IBaseActionSource {
    type: 'lose',
    player: 'local' | 'foreign'
}

/**
 * Schema for validating source JSON data
 */
export const actionLoseSchema = baseActionSchema.keys({
    type: 'lose',
    player: Joi.valid('local', 'foreign').required()
});
