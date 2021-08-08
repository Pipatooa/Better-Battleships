import Joi from 'joi';

export const attributeReferenceSchema = Joi.string().regex(/^(scenario|team|player|ship|ability)\.[a-z\-]+$/).required();