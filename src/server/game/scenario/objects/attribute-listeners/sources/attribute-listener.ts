import Joi                               from 'joi';
import { actionSchema }                  from '../../actions/sources/action';
import { attributeReferenceSchema }      from '../../attribute-references/sources/attribute-reference';
import { valueConstraintSchema }         from '../../constraints/sources/value-constraint';
import type { ActionSource }             from '../../actions/sources/action';
import type { AttributeReferenceSource } from '../../attribute-references/sources/attribute-reference';
import type { IValueConstraintSource }   from '../../constraints/sources/value-constraint';

/**
 * Array of possible attribute listener trigger types
 */
export const attributeListenerTriggerTypes = [
    'once',
    'every',
    'intermittent'
] as const;

/**
 * Type matching all attribute listener trigger types
 */
export type AttributeListenerTriggerType = typeof attributeListenerTriggerTypes[number];

/**
 * JSON source interface reflecting schema
 */
export interface IAttributeListenerSource {
    attribute: AttributeReferenceSource,
    constraint: IValueConstraintSource,
    actions: ActionSource[],
    triggerType: AttributeListenerTriggerType
}

/**
 * Schema for validating source JSON data
 */
export const attributeListenerSchema = Joi.object({
    attribute: attributeReferenceSchema.required(),
    constraint: valueConstraintSchema.required(),
    actions: Joi.array().items(actionSchema).min(1).required(),
    triggerType: Joi.valid(...attributeListenerTriggerTypes).required()
});
