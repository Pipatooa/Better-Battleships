import Joi                                     from 'joi';
import { attributeReferenceSchema }            from '../../attribute-references/sources/attribute-reference';
import type { IValueAttributeReferenceSource } from './value-attribute-reference';
import type { IValueFixedSource }              from './value-fixed';
import type { IValueProductSource }            from './value-product';
import type { IValueRandomSource }             from './value-random';
import type { IValueRoundedSource }            from './value-rounded';
import type { IValueSumSource }                from './value-sum';

/**
 * Type matching all value sources
 */
export type ValueSource =
    IValueFixedSource |
    IValueRandomSource |
    IValueSumSource |
    IValueProductSource |
    IValueRoundedSource |
    IValueAttributeReferenceSource;

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
