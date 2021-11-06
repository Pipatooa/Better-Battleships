import Joi from 'joi';
import { valueSchema } from '../../values/sources/value';
import type { IValueAtLeastConstraintSource } from './value-at-least-constraint';
import type { IValueAtMostConstraintSource } from './value-at-most-constraint';
import type { IValueEqualConstraintSource } from './value-equal-constraint';
import type { IValueInRangeConstraintSource } from './value-in-range-constraint';

/**
 * Type matching all value constraint sources
 */
export type IValueConstraintSource =
    IValueEqualConstraintSource |
    IValueInRangeConstraintSource |
    IValueAtLeastConstraintSource |
    IValueAtMostConstraintSource;

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all value constraints
 */
export const valueConstraintSchema = Joi.object({
    exactly: valueSchema,
    min: valueSchema,
    max: valueSchema
}).without('exactly', [ 'min', 'max' ]);
