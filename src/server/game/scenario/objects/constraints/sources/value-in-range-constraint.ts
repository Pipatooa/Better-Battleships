import Joi from 'joi';
import type { ValueSource } from '../../values/sources/value';
import { valueSchema } from '../../values/sources/value';

/**
 * JSON source interface reflecting schema
 */
export interface IValueInRangeConstraintSource {
    min: ValueSource,
    max: ValueSource
}

/**
 * Schema for validating source JSON data
 */
export const valueInRangeConstraintSchema = Joi.object({
    min: valueSchema.required(),
    max: valueSchema.required()
});
