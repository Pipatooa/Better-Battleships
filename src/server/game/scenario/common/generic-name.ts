import Joi from 'joi';

export const genericNameRegex = /[a-zA-Z\-_\d]+/;
export const genericNameSchema = Joi.string().regex(genericNameRegex);