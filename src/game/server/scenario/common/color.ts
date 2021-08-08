import Joi from 'joi';

export const colorSchema = Joi.string().regex(/#[0-9a-fA-F]{6}/);
