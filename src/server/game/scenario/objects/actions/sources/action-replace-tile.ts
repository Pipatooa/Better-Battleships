import Joi                        from 'joi';
import { baseActionSchema }       from './base-action';
import type { IBaseActionSource } from './base-action';

/**
 * JSON source interface reflecting schema
 */
export interface IActionReplaceTileSource extends IBaseActionSource {
    type: 'replaceTile',
    location: string,
    oldTile: string,
    newTile: string
}

/**
 * Schema for validating source JSON data
 */
export const actionReplaceTileSchema = baseActionSchema.keys({
    type: 'replaceTile',
    location: Joi.string().required(),
    oldTile: Joi.string().length(1).required(),
    newTile: Joi.string().length(1).required()
});
