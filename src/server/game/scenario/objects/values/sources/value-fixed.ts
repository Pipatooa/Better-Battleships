import Joi from 'joi';

/**
 * Schema for validating source JSON data
 */
export const valueFixedSchema = Joi.number().required();

/**
 * JSON source type reflecting schema
 */
export type IValueFixedSource = number;
