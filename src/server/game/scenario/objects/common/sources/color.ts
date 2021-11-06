import Joi from 'joi';

/**
 * Schema for validating source JSON data
 */
export const colorSchema = Joi.string().regex(/#[0-9a-fA-F]{6}/);
