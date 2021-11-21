import { attributeReferenceSchema }      from '../../attribute-references/sources/attribute-reference';
import { valueSchema }                   from '../../values/sources/value';
import { baseActionSchema }              from './base-action';
import type { AttributeReferenceSource } from '../../attribute-references/sources/attribute-reference';
import type { ValueSource }              from '../../values/sources/value';
import type { IBaseActionSource }        from './base-action';

/**
 * JSON source interface reflecting schema
 */
export interface IActionSetAttributeSource extends IBaseActionSource {
    type: 'setAttribute',
    attribute: AttributeReferenceSource,
    value: ValueSource
}

/**
 * Schema for validating source JSON data
 */
export const actionSetAttributeSchema = baseActionSchema.keys({
    type: 'setAttribute',
    attribute: attributeReferenceSchema.required(),
    value: valueSchema.required()
});
