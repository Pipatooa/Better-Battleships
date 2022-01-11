import Joi                   from 'joi';
import { actionSchema }      from '../actions/sources/action';
import { genericNameSchema } from '../common/sources/generic-name';
import { tileEventInfo }     from '../events/board-events';
import { tileTypeSchema }    from './tile-type';
import type { ActionSource } from '../actions/sources/action';
import type { TileEvent }    from '../events/board-events';
import type { TileType }     from '../tiletype';

/**
 * JSON source interface reflecting schema
 */
export interface IBoardSource {
    size: [ x: number, y: number ];
    tilePalette: { [char: string]: TileType },
    regionPalette: { [char: string]: string[] },
    tiles: string[],
    regions: string[],
    tileActions: { [char: string]: { [event in TileEvent]: ActionSource[] } },
    regionActions: { [name: string]: { [event in TileEvent]: ActionSource[] } }
}

/**
 * Schema for validating source JSON data
 */
export const boardSchema = Joi.object({
    size: Joi.array().items(
        Joi.number().integer().min(5)
    ).length(2).required(),
    tilePalette: Joi.object().pattern(
        Joi.string().length(1),
        tileTypeSchema
    ).required(),
    regionPalette: Joi.object().pattern(
        Joi.string().length(1),
        Joi.array().items(genericNameSchema)
    ).required(),
    tiles: Joi.array().items(
        Joi.string().min(5)
    ).min(5).required(),
    regions: Joi.array().items(
        Joi.string().min(5)
    ).min(5).required(),
    tileActions: Joi.object().pattern(
        Joi.string().length(1),
        Joi.object().pattern(
            Joi.valid(...Object.keys(tileEventInfo)),
            Joi.array().items(actionSchema.keys({
                priority: Joi.number().required()
            }))).required()
    ).required(),
    regionActions: Joi.object().pattern(
        Joi.string(),
        Joi.object().pattern(
            Joi.valid(...Object.keys(tileEventInfo)),
            Joi.array().items(actionSchema.keys({
                priority: Joi.number().required()
            }))).required()
    ).required()
});
