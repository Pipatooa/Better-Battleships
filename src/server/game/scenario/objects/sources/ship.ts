import Joi                        from 'joi';
import { attributeHolderSchema }  from '../attributes/sources/attribute-holder';
import { descriptorSchema }       from '../common/sources/descriptor';
import { genericNameSchema }      from '../common/sources/generic-name';
import { patternSchema }          from '../common/sources/pattern';
import type { IAttributeSource }  from '../attributes/sources/attribute';
import type { IDescriptorSource } from '../common/sources/descriptor';
import type { IPatternSource }    from '../common/sources/pattern';

/**
 * JSON source interface reflecting schema
 */
export interface IShipSource {
    descriptor: IDescriptorSource;
    pattern: IPatternSource;
    abilities: string[];
    visibility: number;
    attributes: { [name: string]: IAttributeSource };
}

/**
 * Schema for validating source JSON data
 */
export const shipSchema = Joi.object({
    descriptor: descriptorSchema.required(),
    pattern: patternSchema.required(),
    visibility: Joi.number().integer().min(1).required(),
    abilities: Joi.array().items(genericNameSchema).required()
}).concat(attributeHolderSchema);
