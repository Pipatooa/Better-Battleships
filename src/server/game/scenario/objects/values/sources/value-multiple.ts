import Joi                       from 'joi';
import { baseValueSchema }       from './base-value';
import { valueSchema }           from './value';
import type { IBaseValueSource } from './base-value';
import type { ValueSource }      from './value';

/**
 * JSON source interface reflecting schema
 */
export interface IValueMultipleSource extends IBaseValueSource {
    values: ValueSource[];
}

/**
 * Schema for validating source JSON data
 */
export const valueMultipleSchema = baseValueSchema.keys({
    values: Joi.array().items(valueSchema).min(2).required()
});
