import Joi                  from 'joi';
import { valueSchema }      from '../../values/sources/value';
import type { ValueSource } from '../../values/sources/value';

/**
 * JSON source interface reflecting schema
 */
export interface IValueAtLeastConstraintSource {
    min: ValueSource;
}

/**
 * Schema for validating source JSON data
 */
export const valueAtLeastConstraintSchema = Joi.object({
    min: valueSchema.required()
});
