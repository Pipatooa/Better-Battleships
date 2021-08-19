import Joi from 'joi';
import {IValueAtLeastConstraintSource} from './value-at-least-constraint';
import {IValueAtMostConstraintSource} from './value-at-most-constraint';
import {IValueEqualConstraintSource} from './value-equal-constraint';
import {IValueInRangeConstraintSource} from './value-in-range-constraint';

/**
 * ValueConstraint - Server Version
 *
 * Base class for value constrains which allow a value to be checked against themselves,
 * or for a value to be changed to meet the constrain
 */
export abstract class ValueConstraint {
    /**
     * Checks whether or not a value meets this constraint
     * @param value Value to check
     * @returns boolean -- Whether value met this constraint
     */
    abstract check(value: number): boolean;

    /**
     * Changes a value to meet this constraint
     * @param value Value to constrain
     * @returns newValue -- New value that meets this constraint
     */
    abstract constrain(value: number): number;
}

/**
 * JSON source interface reflecting schema
 */
export type IValueConstraintSource =
    IValueEqualConstraintSource |
    IValueInRangeConstraintSource |
    IValueAtLeastConstraintSource |
    IValueAtMostConstraintSource;

/**
 * Schema for validating source JSON data
 */
export const valueConstraintSchema = Joi.object({
    exactly: Joi.number(),
    min: Joi.number(),
    max: Joi.number().min(Joi.ref('min'))
}).without('exactly', ['min', 'max']);