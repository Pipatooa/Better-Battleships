import Joi from 'joi';
import { genericNameSchema } from '../../common/sources/generic-name';

/**
 * JSON source interface reflecting schema
 */
export interface IForeignAttributeRegistrySource {
    team: string[],
    player: string[],
    ship: string[]
}

/**
 * Schema for validating source JSON data
 */
export const foreignAttributeRegistrySchema = Joi.object({
    team: Joi.array().items(genericNameSchema).required(),
    player: Joi.array().items(genericNameSchema).required(),
    ship: Joi.array().items(genericNameSchema).required()
});
