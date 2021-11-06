import Joi from 'joi';
import type { IAttributeSource } from '../attributes/sources/attribute';
import { attributeHolderSchema } from '../attributes/sources/attribute-holder';
import type { IDescriptorSource } from '../common/sources/descriptor';
import { descriptorSchema } from '../common/sources/descriptor';
import { genericNameSchema } from '../common/sources/generic-name';
import type { IPatternSource } from '../common/sources/pattern';
import { patternSchema } from '../common/sources/pattern';

/**
 * JSON source interface reflecting schema
 */
export interface IShipSource {
    descriptor: IDescriptorSource;
    pattern: IPatternSource;
    abilities: string[];
    attributes: { [name: string]: IAttributeSource };
}

/**
 * Schema for validating source JSON data
 */
export const shipSchema = Joi.object({
    descriptor: descriptorSchema.required(),
    pattern: patternSchema.required(),
    abilities: Joi.array().items(genericNameSchema).required()
}).concat(attributeHolderSchema);
