import Joi                           from 'joi';
import { baseConditionSchema }       from './base-condition';
import type { IBaseConditionSource } from './base-condition';

/**
 * JSON source interface reflecting schema
 */
export interface IConditionFixedSource extends IBaseConditionSource {
    type: 'fixed',
    result: boolean,
    inverted: never
}

/**
 * Schema for validating source JSON data
 */
export const conditionFixedSchema = baseConditionSchema.keys({
    type: 'fixed',
    result: Joi.boolean().required(),
    inverted: Joi.forbidden()
});
