import Joi from 'joi';

export const attributeReferenceSchema = Joi.string().regex(/^(scenario|team|player|ship|ability)\.[a-zA-Z\-_]+$/).required();

export type AttributeReference = string;

export type AttributeSelector =
    'scenario' |
    'team' |
    'player' |
    'ship' |
    'ability';
