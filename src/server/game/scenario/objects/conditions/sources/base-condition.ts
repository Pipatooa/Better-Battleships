import Joi from 'joi';

/**
 * JSON source interface reflecting base condition schema
 */
export interface IBaseConditionSource {
    type: string,
    inverted: boolean | undefined
}

/**
 * Base schema for validating source JSON data
 */
export const baseConditionSchema = Joi.object({
    type: Joi.string().required(),
    inverted: Joi.boolean().optional()
});
