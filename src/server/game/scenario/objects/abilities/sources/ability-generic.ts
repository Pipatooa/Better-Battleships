import Joi                         from 'joi';
import { baseAbilitySchema }       from './base-ability';
import type { IBaseAbilitySource } from './base-ability';

/**
 * JSON source interface reflecting schema
 */
export interface IAbilityGenericSource extends IBaseAbilitySource {
    type: 'generic',
    buttonText: string
}

/**
 * Schema for validating source JSON data
 */
export const abilityGenericSchema = baseAbilitySchema.keys({
    type: 'generic',
    buttonText: Joi.string().required()
});
