import Joi from 'joi';
import { attributeReferenceSchema } from '../attributes/references/attribute-reference';
import { EvaluationContext } from '../evaluation-context';
import { IValueAttributeReferenceSource } from './value-attribute-reference';
import { IValueFixedSource } from './value-fixed';
import { IValueProductSource } from './value-product';
import { IValueRandomSource } from './value-random';
import { IValueRoundedSource } from './value-rounded';
import { IValueSumSource } from './value-sum';

/**
 * Value - Server Version
 *
 * Base class for generic value type
 *
 * When evaluated, values return a number, which can be a dynamic value
 */
export abstract class Value {

    /**
     * Evaluate this dynamic value as a number
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public abstract evaluate(evaluationContext: EvaluationContext): number;
}

/**
 * JSON source interface reflecting base value schema
 */
export interface IBaseValueSource {
    type: string;
}

/**
 * JSON source interface reflecting full value schema
 */
export type IValueSource =
    IValueFixedSource |
    IValueRandomSource |
    IValueSumSource |
    IValueProductSource |
    IValueRoundedSource |
    IValueAttributeReferenceSource;

/**
 * Base schema for validating source JSON data
 */
export const baseValueSchema = Joi.object({
    type: Joi.string()
});

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all values
 */
export const valueSchema = Joi.alternatives(
    Joi.number(),
    Joi.object({
        type: Joi.valid('random', 'sum', 'product', 'round', 'attributeReference').required(),
        min: Joi.alternatives(Joi.number(), Joi.link('...')).when('type',
            { is: 'random', then: Joi.required(), otherwise: Joi.forbidden() }),
        max: Joi.alternatives(Joi.number(), Joi.link('...')).when('type',
            { is: 'random', then: Joi.required(), otherwise: Joi.forbidden() }),
        step: Joi.alternatives(Joi.number(), Joi.link('...')).when('type', {
            switch: [
                { is: 'random', then: Joi.optional() },
                { is: 'round', then: Joi.required() }
            ],
            otherwise: Joi.forbidden()
        }),
        generateOnce: Joi.boolean().when('type',
            { is: 'random', then: Joi.required(), otherwise: Joi.forbidden() }),
        values: Joi.array().items(Joi.alternatives(Joi.number(), Joi.link('....'))).min(2).when('type',
            { is: Joi.valid('sum', 'product'), then: Joi.required(), otherwise: Joi.forbidden() }),
        value: Joi.alternatives(Joi.number(), Joi.link('...')).when('type',
            { is: 'round', then: Joi.required(), otherwise: Joi.forbidden() }),
        attribute: attributeReferenceSchema.when('type',
            { is: 'attributeReference', then: Joi.required(), otherwise: Joi.forbidden() })
    })
);
