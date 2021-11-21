import Joi                   from 'joi';
import { genericNameRegex }  from '../../common/sources/generic-name';
import { attributeSchema }   from './attribute';
import type { AttributeMap } from '../i-attribute-holder';


/**
 * JSON source interface reflecting schema
 */
export interface IAttributeHolder {
    readonly attributes: AttributeMap;
}

/**
 * Schema for validating source JSON data
 */
export const attributeHolderSchema = Joi.object({
    attributes: Joi.object().pattern(genericNameRegex, attributeSchema).required()
});
