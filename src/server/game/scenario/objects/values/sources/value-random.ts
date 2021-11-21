import Joi                       from 'joi';
import { baseValueSchema }       from './base-value';
import { valueSchema }           from './value';
import type { IBaseValueSource } from './base-value';
import type { ValueSource }      from './value';

/**
 * Schema for validating source JSON data
 */
export const valueRandomSchema = baseValueSchema.keys({
    type: 'random',
    min: valueSchema.required(),
    max: valueSchema.required(),
    step: valueSchema,
    generateOnce: Joi.boolean().required()
});

/**
 * JSON source interface reflecting schema
 */
export interface IValueRandomSource extends IBaseValueSource {
    type: 'random',
    min: ValueSource,
    max: ValueSource,
    step: ValueSource | undefined,
    generateOnce: boolean
}
