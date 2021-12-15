import Joi                  from 'joi';
import { genericNameRegex } from '../../common/sources/generic-name';
import { attributeSchema }  from './attribute';

/**
 * Schema for validating source JSON data
 */
export const attributeHolderSchema = Joi.object({
    attributes: Joi.object().pattern(genericNameRegex, attributeSchema).required()
});
