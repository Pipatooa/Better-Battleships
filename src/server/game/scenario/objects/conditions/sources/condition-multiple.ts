import Joi                           from 'joi';
import { baseConditionSchema }       from './base-condition';
import { conditionSchema }           from './condition';
import type { IBaseConditionSource } from './base-condition';
import type { ConditionSource }      from './condition';

/**
 * JSON source interface reflecting schema
 */
export interface IConditionMultipleSource extends IBaseConditionSource {
    subConditions: ConditionSource[];
}

/**
 * Schema for validating source JSON data
 */
export const conditionMultipleSchema = baseConditionSchema.keys({
    subConditions: Joi.array().items(conditionSchema).min(2).required()
});
