import Joi from 'joi';
import { EvaluationContext } from '../evaluation-context';
import { valueSchema } from '../values/value';
import { IValueAtLeastConstraintSource } from './value-at-least-constraint';
import { IValueAtMostConstraintSource } from './value-at-most-constraint';
import { IValueEqualConstraintSource } from './value-equal-constraint';
import { IValueInRangeConstraintSource } from './value-in-range-constraint';

/**
 * ValueConstraint - Server Version
 *
 * Base class for value constrains which allow a value to be checked against themselves,
 * or for a value to be changed to meet the constrain
 */
export abstract class ValueConstraint {
    
    /**
     * Checks whether or not a value meets this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to check
     * @returns                    Whether value met this constraint
     */
    abstract check(evaluationContext: EvaluationContext, value: number): boolean;

    /**
     * Changes a value to meet this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to constrain
     * @returns                    New value that meets this constraint
     */
    abstract constrain(evaluationContext: EvaluationContext, value: number): number;
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
    exactly: valueSchema,
    min: valueSchema,
    max: valueSchema
}).without('exactly', [ 'min', 'max' ]);
