import Joi from 'joi';

/**
 * Regex matching all attribute reference strings
 */
export const attributeReferenceRegex = /^(local:(scenario|team|player|ship|ability)|foreign:(team|player|ship))\.[a-zA-Z\-_\d]+$/;

/**
 * Schema for validating source JSON data
 */
export const attributeReferenceSchema = Joi.string().regex(attributeReferenceRegex).required();


/**
 * Type matching reference type part of attribute reference strings
 */
export type AttributeReferenceType =
    'local' |
    'foreign';

/**
 * Type matching object selector part of attribute reference strings
 */
export type AttributeReferenceObjectSelector =
    'scenario' |
    'team' |
    'player' |
    'ship' |
    'ability';

/**
 * Type matching all attribute reference strings
 */
export type AttributeReferenceSource = string;
