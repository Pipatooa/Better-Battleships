import Joi from 'joi';
import type { IBaseConditionSource } from './base-condition';
import { baseConditionSchema } from './base-condition';
import type { ConditionSource } from './condition';
import { conditionSchema } from './condition';

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
