import Joi from 'joi';
import { valueConstraintSchema } from '../constraints/value-constaint';
import { EvaluationContext } from '../evaluation-context';
import { valueSchema } from '../values/value';
import { IConditionAllSource } from './condition-all';
import { IConditionAnySource } from './condition-any';
import { IConditionValueMeetsConstraintSource } from './condition-value-meets-constraint';
import { IConditionSomeSource } from './condition-some';
import { IConditionFixedSource } from './condition-fixed';

/**
 * Condition - Server Version
 *
 * Base class for conditions which can be checked to return a boolean value
 */
export abstract class Condition {

    /**
     * Base Condition constructor
     *
     * @param  inverted Whether or not the condition result will be inverted before it is returned
     * @protected
     */
    protected constructor(public readonly inverted: boolean) {
    }

    /**
     * Checks whether or not this condition holds true
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Whether or not this condition holds true
     */
    public abstract check(evaluationContext: EvaluationContext): boolean;
}

/**
 * JSON source interface reflecting base condition schema
 */
export interface IBaseConditionSource {
    type: string,
    inverted: boolean | undefined
}

/**
 * JSON source interface reflecting full condition schema
 */
export type IConditionSource =
    Record<string, never> |
    IConditionAnySource |
    IConditionAllSource |
    IConditionSomeSource |
    IConditionFixedSource |
    IConditionValueMeetsConstraintSource;

/**
 * Base schema for validating source JSON data
 */
export const baseConditionSchema = Joi.object({
    type: Joi.string().required(),
    inverted: Joi.boolean().optional()
});

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all conditions
 */
export const conditionSchema = baseConditionSchema.keys({
    type: Joi.valid('any', 'all', 'some', 'fixed', 'none', 'valueMeetsConstraint').required(),
    subConditions: Joi.array().items(Joi.link('...')).min(2).when('type',
        { is: Joi.valid('any', 'all', 'some'), then: Joi.required(), otherwise: Joi.forbidden() }),
    valueConstraint: valueConstraintSchema.when('type',
        { is: 'some', then: Joi.required(), otherwise: Joi.forbidden() }),
    result: Joi.boolean().when('type',
        { is: 'fixed', then: Joi.required(), otherwise: Joi.forbidden() }),
    value: valueSchema.when('type',
        { is: 'valueMeetsConstraint', then: Joi.required(), otherwise: Joi.forbidden() }),
    constraint: valueConstraintSchema.when('type',
        { is: 'valueMeetsConstraint', then: Joi.required(), otherwise: Joi.forbidden() }),
    inverted: Joi.boolean().when('type',
        { is: Joi.valid('fixed', 'none'), then: Joi.forbidden(), otherwise: Joi.optional() })
});
