import Joi from 'joi';

/**
 * JSON source interface reflecting schema
 */
export interface IDescriptorSource {
    name: string;
    description: string;
}

/**
 * Schema for validating source JSON data
 */
export const descriptorSchema = Joi.object({
    name: Joi
        .string()
        .min(1)
        .max(32)
        .required(),
    description: Joi
        .string()
        .required()
});
