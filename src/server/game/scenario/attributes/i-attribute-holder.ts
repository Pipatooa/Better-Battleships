import Joi from 'joi';
import { genericNameRegex } from '../common/generic-name';
import { Attribute, attributeSchema, IAttributeSource } from './attribute';

/**
 * Type describing a dictionary of string (name) indexed attributes
 */
export type AttributeMap = { [name: string]: Attribute };
/**
 * Type describing a dictionary of string (name) index attribute sources
 */
export type AttributeMapSource = { [name: string]: IAttributeSource };

/**
 * JSON source interface reflecting schema
 */
export interface IAttributeHolder {
    readonly attributes: AttributeMap;
}

/**
 * Schema for validating source JSON data
 */
export const attributeHolderSchema = Joi.object({
    attributes: Joi.object().pattern(genericNameRegex, attributeSchema).required()
});
