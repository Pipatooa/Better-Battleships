import Joi from 'joi';

/**
 * Regex pattern matching a generic name
 */
export const genericNameRegex = /[a-zA-Z\-_\d]+/;

/**
 * Schema for validating source JSON data
 */
export const genericNameSchema = Joi.string().regex(genericNameRegex);
