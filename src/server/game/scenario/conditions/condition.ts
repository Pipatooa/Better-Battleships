import Joi from 'joi';
import {attributeSchema} from '../attributes/attribute';
import {valueConstraintSchema} from '../constraints/value-constaint';
import {IConditionAllSource} from './condition-all';
import {IConditionAnySource} from './condition-any';
import {IConditionAttributeSource} from './condition-attribute';
import {IConditionSomeSource} from './condition-some';
import {IConditionTestSource} from './condition-test';

/**
 * Condition - Server Version
 *
 * Base class for conditions which can be checked to return a boolean value
 */
export abstract class Condition {

    /**
     * Base Condition constructor
     * @param inverted Whether or not the condition result will be inverted before it is returned
     * @protected
     */
    protected constructor(public readonly inverted: boolean) {
    };

    /**
     * Checks whether or not this condition holds true
     * @returns boolean -- Whether or not this condition holds true
     */
    abstract check(): boolean;
}

/**
 * JSON source interface reflecting base condition schema
 */
export interface IBaseConditionSource {
    type: string,
    inverted: boolean
}

/**
 * JSON source interface reflecting full condition schema
 */
export type IConditionSource =
    IConditionAnySource |
    IConditionAllSource |
    IConditionSomeSource |
    IConditionTestSource |
    IConditionAttributeSource

/**
 * Base schema for validating source JSON data
 */
export const baseConditionSchema = Joi.object({
    type: Joi.string().required(),
    inverted: Joi.boolean().default(false)
});

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all conditions
 */
export const conditionSchema = baseConditionSchema.keys({
    type: Joi.valid('any', 'all', 'some', 'test', 'attribute').required(),
    subConditions: Joi.array().items(Joi.link('#condition')).min(2).when('type',
        { is: Joi.valid('any', 'all', 'some'), then: Joi.required(), otherwise: Joi.forbidden() }),
    valueConstraint: valueConstraintSchema.when('type',
        { is: 'some', then: Joi.required(), otherwise: Joi.forbidden() }),
    result: Joi.boolean().when('type',
        { is: 'test', then: Joi.required(), otherwise: Joi.forbidden() }),
    attribute: attributeSchema.when('type',
        { is: 'attribute', then: Joi.required(), otherwise: Joi.forbidden() })
}).id('condition');