import Joi                        from 'joi';
import { baseActionSchema }       from './base-action';
import type { IBaseActionSource } from './base-action';

/**
 * JSON source interface reflecting schema
 */
export interface IActionSetTileSource extends IBaseActionSource {
    type: 'setTile',
    location: string,
    tile: string
}

/**
 * Schema for validating source JSON data
 */
export const actionSetTileSchema = baseActionSchema.keys({
    type: 'setTile',
    location: Joi.string().required(),
    tile: Joi.string().length(1).required()
});
