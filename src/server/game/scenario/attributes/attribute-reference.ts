import Joi from 'joi';

/**
 * Schema for validating source JSON data
 */
export const attributeReferenceSchema = Joi.string().regex(/^(scenario|team|player|ship|ability)\.[a-zA-Z\-_\d]+$/).required();

/**
 * Generic type for attribute references
 *
 * Typescript does not support pattern matching string types
 */
export type AttributeReference = string;

/**
 * Union string type matching selector part of attribute references
 */
export type AttributeSelector =
    'scenario' |
    'team' |
    'player' |
    'ship' |
    'ability';
