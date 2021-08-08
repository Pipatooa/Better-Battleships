import Joi from 'joi';

export const genericNameSchema = Joi.string().regex(/[a-z\-]+/);