import Joi from 'joi';
import type { ValueSource } from '../../values/sources/value';
import { valueSchema } from '../../values/sources/value';

/**
 * JSON source interface reflecting schema
 */
export interface IValueAtMostConstraintSource {
    max: ValueSource;
}

/**
 * Schema for validating source JSON data
 */
export const valueAtMostConstraintSchema = Joi.object({
    max: valueSchema.required()
});
