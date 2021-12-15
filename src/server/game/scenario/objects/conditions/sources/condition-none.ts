import Joi                           from 'joi';
import { baseConditionSchema }       from './base-condition';
import type { IBaseConditionSource } from './base-condition';

/**
 * JSON source interface reflecting schema
 */
export interface IConditionNoneSource extends IBaseConditionSource {
    type: 'none'
}

/**
 * Schema for validating source JSON data
 */
export const conditionNoneSchema = baseConditionSchema.keys({
    type: 'none',
    inverted: Joi.forbidden()
});
