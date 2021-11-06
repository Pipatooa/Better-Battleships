import { attributeReferenceSchema } from '../../attribute-references/sources/attribute-reference';
import type { IBaseValueSource } from './base-value';
import { baseValueSchema } from './base-value';

/**
 * Schema for validating source JSON data
 */
export const valueAttributeReferenceSchema = baseValueSchema.keys({
    type: 'attributeReference',
    attribute: attributeReferenceSchema.required()
});

/**
 * JSON source interface reflecting schema
 */
export interface IValueAttributeReferenceSource extends IBaseValueSource {
    type: 'attributeReference',
    attribute: string
}
