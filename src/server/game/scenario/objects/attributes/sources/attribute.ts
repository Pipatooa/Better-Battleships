import Joi from 'joi';
import type { IValueConstraintSource } from '../../constraints/sources/value-constraint';
import { valueConstraintSchema } from '../../constraints/sources/value-constraint';
import type { ValueSource } from '../../values/sources/value';
import { valueSchema } from '../../values/sources/value';

/**
 * JSON source interface reflecting schema
 */
export interface IAttributeSource {
    initialValue: ValueSource;
    constraints: IValueConstraintSource[];
    readonly: boolean;
}

/**
 * Schema for validating source JSON data
 */
export const attributeSchema = Joi.object({
    initialValue: valueSchema.required(),
    constraints: Joi.array().items(valueConstraintSchema).required(),
    readonly: Joi.boolean().required()
});
