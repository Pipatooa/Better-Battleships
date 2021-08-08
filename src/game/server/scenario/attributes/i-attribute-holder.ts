import Joi from 'joi';
import {Attribute, attributeSchema, IAttributeSource} from './attribute';

export type AttributeMap = { [name: string]: Attribute };
export type AttributeMapSource = { [name: string]: IAttributeSource };

export interface IAttributeHolder {
    readonly attributes: AttributeMap;
}

export const attributeHolderSchema = Joi.object({
    attributes: Joi.object().pattern(/[a-z\-]+/, attributeSchema).required()
});
