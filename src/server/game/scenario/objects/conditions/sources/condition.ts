import Joi                                           from 'joi';
import { valueConstraintSchema }                     from '../../constraints/sources/value-constraint';
import { valueSchema }                               from '../../values/sources/value';
import { baseConditionSchema }                       from './base-condition';
import type { IConditionAllSource }                  from './condition-all';
import type { IConditionAnySource }                  from './condition-any';
import type { IConditionSomeSource }                 from './condition-some';
import type { IConditionValueMeetsConstraintSource } from './condition-value-meets-constraint';

/**
 * Type matching all condition sources
 */
export type ConditionSource =
    null |
    Record<string, never> |
    IConditionAnySource |
    IConditionAllSource |
    IConditionSomeSource |
    IConditionValueMeetsConstraintSource;

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all conditions
 */
export const conditionSchema = baseConditionSchema.keys({
    type: Joi.valid('any', 'all', 'some', 'fixed', 'valueMeetsConstraint').required(),
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
    inverted: Joi.boolean().optional()
});

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all conditions including empty conditions
 */
export const nullableConditionSchema = Joi.alternatives(
    null,
    Joi.object().required(),
    conditionSchema.required()
);
