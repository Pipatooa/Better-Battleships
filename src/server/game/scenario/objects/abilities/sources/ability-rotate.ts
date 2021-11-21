import Joi                         from 'joi';
import { baseAbilitySchema }       from './base-ability';
import type { IBaseAbilitySource } from './base-ability';

/**
 * JSON source interface reflecting schema
 */
export interface IAbilityRotateSource extends IBaseAbilitySource {
    type: 'rotate',
    rot90: boolean,
    rot180: boolean,
    rot270: boolean
}

/**
 * Schema for validating source JSON data
 */
export const abilityRotateSchema = baseAbilitySchema.keys({
    type: 'rotate',
    rot90: Joi.boolean().required(),
    rot180: Joi.boolean().required(),
    rot270: Joi.boolean().required()
});
