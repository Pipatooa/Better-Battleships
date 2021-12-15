import Joi                        from 'joi';
import { builtinAttributePrefix } from '../../attributes/sources/builtin-attributes';

/**
 * Array of possible attribute reference types
 */
export const attributeReferenceTypes = [
    'local',
    'foreign'
] as const;

/**
 * Array of possible object selectors for foreign attribute references
 */
export const attributeReferenceForeignObjectSelectors = [
    'team',
    'player',
    'ship',
    'ability'
] as const;

/**
 * Array of possible object selectors for local attribute references
 */
export const attributeReferenceLocalObjectSelectors = [
    'scenario',
    ...attributeReferenceForeignObjectSelectors
] as const;

/**
 * Array of possible object selectors for special attribute references
 */
export const attributeReferenceSpecialObjectSelectors = [
    ...attributeReferenceLocalObjectSelectors,
    'event'
] as const;

/**
 * Array of possible object selector parts of qll attribute reference strings
 */
export const attributeReferenceObjectSelectors = [
    ...attributeReferenceForeignObjectSelectors,
    ...attributeReferenceForeignObjectSelectors,
    ...attributeReferenceSpecialObjectSelectors
] as const;

/**
 * Regex matching all attribute reference strings
 */
export const attributeReferenceRegex = new RegExp(`^(${attributeReferenceTypes.join('|')}):(${attributeReferenceSpecialObjectSelectors.join('|')})\\.(${builtinAttributePrefix})?([a-zA-Z\\-_\\d]+)$`);

/**
 * Schema for validating source JSON data
 */
export const attributeReferenceSchema = Joi.string().regex(attributeReferenceRegex).required();

/**
 * Type matching all reference type strings
 */
export type AttributeReferenceType = typeof attributeReferenceTypes[number];

/**
 * Type matching all reference object selector strings
 */
export type AttributeReferenceObjectSelector = typeof attributeReferenceObjectSelectors[number];

/**
 * Type matching all reference local object selector strings
 */
export type AttributeReferenceLocalObjectSelector = typeof attributeReferenceLocalObjectSelectors[number];

/**
 * Type matching all reference foreign object selector strings
 */
export type AttributeReferenceForeignObjectSelector = typeof attributeReferenceForeignObjectSelectors[number];

/**
 * Type matching all reference special object selector strings
 */
export type AttributeReferenceSpecialObjectSelector = typeof attributeReferenceSpecialObjectSelectors[number];

/**
 * Type matching all attribute reference strings
 */
export type AttributeReferenceSource = string;
