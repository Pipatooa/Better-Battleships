import Joi from 'joi';
import {genericNameRegex} from '../common/generic-name';
import {Attribute, attributeSchema, IAttributeSource} from './attribute';

export type AttributeMap = { [name: string]: Attribute };
export type AttributeMapSource = { [name: string]: IAttributeSource };

export interface IAttributeHolder {
    readonly attributes: AttributeMap;
}

export const attributeHolderSchema = Joi.object({
    attributes: Joi.object().pattern(genericNameRegex, attributeSchema).required()
});
