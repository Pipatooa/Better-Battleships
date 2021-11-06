import Joi from 'joi';

/**
 * Base schema for validating source JSON data
 */
export const baseValueSchema = Joi.object({
    type: Joi.string()
});

/**
 * JSON source interface reflecting base value schema
 */
export interface IBaseValueSource {
    type: string;
}
