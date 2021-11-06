import Joi from 'joi';
import type { AttributeMapSource } from '../attributes/i-attribute-holder';
import { attributeHolderSchema } from '../attributes/sources/attribute-holder';
import { genericNameSchema } from '../common/sources/generic-name';

/**
 * JSON source interface reflecting schema
 */
export interface IPlayerSource {
    ships: string[];
    attributes: AttributeMapSource;
}

/**
 * Schema for validating source JSON data
 */
export const playerSchema = Joi.object({
    ships: Joi.array().items(genericNameSchema).min(1).required()
}).concat(attributeHolderSchema);
