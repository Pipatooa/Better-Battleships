import Joi from 'joi';

/**
 * JSON source interface reflecting schema
 */
export interface IPatternSource {
    size: [ number, number ],
    values: { [char: string]: number },
    pattern: string[]
}

/**
 * Schema for validating source JSON data
 */
export const patternSchema = Joi.object({
    size: Joi.array().items(
        Joi.number().integer().min(1)
    ).length(2).required(),
    values: Joi.object().pattern(Joi.string().length(1), Joi.number()).min(1).required(),
    pattern: Joi.array().items(
        Joi.string().min(1)
    ).min(1).required()
});
