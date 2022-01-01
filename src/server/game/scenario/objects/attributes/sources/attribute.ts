import Joi                             from 'joi';
import { descriptorSchema }            from '../../common/sources/descriptor';
import { valueConstraintSchema }       from '../../constraints/sources/value-constraint';
import { valueSchema }                 from '../../values/sources/value';
import type { IDescriptorSource }      from '../../common/sources/descriptor';
import type { IValueConstraintSource } from '../../constraints/sources/value-constraint';
import type { ValueSource }            from '../../values/sources/value';

/**
 * JSON source interface reflecting schema
 */
export interface IAttributeSource {
    descriptor: IDescriptorSource | Record<string, never>,
    initialValue: ValueSource,
    constraints: IValueConstraintSource[],
    readonly: boolean
}

/**
 * Schema for validating source JSON data
 */
export const attributeSchema = Joi.object({
    descriptor: Joi.alternatives(
        Joi.object(),
        descriptorSchema
    ).required(),
    initialValue: valueSchema.required(),
    constraints: Joi.array().items(valueConstraintSchema).required(),
    readonly: Joi.boolean().required()
});
