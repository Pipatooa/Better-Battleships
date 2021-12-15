import Joi                                              from 'joi';
import { genericNameSchema }                            from '../../common/sources/generic-name';
import { attributeReferenceForeignObjectSelectors }     from './attribute-reference';
import type { AttributeReferenceForeignObjectSelector } from './attribute-reference';

/**
 * JSON source type reflecting schema
 */
export type ForeignAttributeRegistrySource = Record<AttributeReferenceForeignObjectSelector, string[]>;

/**
 * Dynamic schema construction
 */
const internalSchema = {} as Record<AttributeReferenceForeignObjectSelector, Joi.Schema>;
for (const attributeReferenceForeignObjectSelector of attributeReferenceForeignObjectSelectors)
    internalSchema[attributeReferenceForeignObjectSelector] = Joi.array().items(genericNameSchema).required();

/**
 * Schema for validating source JSON data
 */
export const foreignAttributeRegistrySchema = Joi.object(internalSchema);
