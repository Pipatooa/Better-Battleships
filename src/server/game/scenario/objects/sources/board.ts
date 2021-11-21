import Joi                     from 'joi';
import { genericNameSchema }   from '../common/sources/generic-name';
import { tileGeneratorSchema } from '../tile-generator';
import { tileTypeSchema }      from './tile-type';
import type { TileGenerator }  from '../tile-generator';
import type { TileType }       from '../tiletype';

/**
 * JSON source interface reflecting schema
 */
export interface IBoardSource {
    size: [ x: number, y: number ];
    tilePalette: { [char: string]: TileType },
    regionPalette: { [char: string]: string[] },
    tiles: string[],
    regions: string[],
    generators: TileGenerator[]
}

/**
 * Schema for validating source JSON data
 */
export const boardSchema = Joi.object({
    size: Joi.array().items(
        Joi.number().integer().min(5)
    ).length(2).required(),
    tilePalette: Joi.object().pattern(Joi.string().length(1), tileTypeSchema).required(),
    regionPalette: Joi.object().pattern(Joi.string().length(1), Joi.array().items(genericNameSchema)).required(),
    tiles: Joi.array().items(
        Joi.string().min(5)
    ).min(5).required(),
    regions: Joi.array().items(
        Joi.string().min(5)
    ).min(5).required(),
    generators: Joi.array().items(tileGeneratorSchema).required()
});
