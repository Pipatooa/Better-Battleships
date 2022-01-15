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
    constraint: IValueConstraintSource | null,
    readonly: boolean
}

/**
 * Schema for validating source JSON data
 */
export const attributeSchema = Joi.object({
    descriptor: Joi.alternatives(
        null,
        Joi.object(),
        descriptorSchema
    ).required(),
    initialValue: valueSchema.required(),
    constraint: Joi.alternatives(
        null,
        Joi.object(),
        valueConstraintSchema
    ).required(),
    readonly: Joi.boolean().required()
});
