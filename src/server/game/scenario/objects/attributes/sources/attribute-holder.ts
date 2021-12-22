import Joi                               from 'joi';
import { attributeListenerSchema }       from '../../attribute-listeners/sources/attribute-listener';
import { genericNameRegex }              from '../../common/sources/generic-name';
import { attributeSchema }               from './attribute';
import type { IAttributeListenerSource } from '../../attribute-listeners/sources/attribute-listener';
import type { AttributeMapSource }       from '../i-attribute-holder';

/**
 * JSON source interface reflecting schema
 */
export interface IAttributeHolderSource {
    attributes: AttributeMapSource,
    attributeListeners: IAttributeListenerSource[]
}

/**
 * Schema for validating source JSON data
 */
export const attributeHolderSchema = Joi.object({
    attributes: Joi.object().pattern(genericNameRegex, attributeSchema).required(),
    attributeListeners: Joi.array().items(attributeListenerSchema).required()
});
