import Joi                  from 'joi';
import { valueSchema }      from '../../values/sources/value';
import type { ValueSource } from '../../values/sources/value';

/**
 * JSON source interface reflecting schema
 */
export interface IValueEqualConstraintSource {
    exactly: ValueSource;
}

/**
 * Schema for validating source JSON data
 */
export const valueEqualConstraintSchema = Joi.object({
    exactly: valueSchema.required()
});
