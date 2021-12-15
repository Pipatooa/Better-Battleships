import type {
    AttributeReferenceLocalObjectSelector } from '../attribute-references/sources/attribute-reference';
import type { AttributeSpecial }  from './attribute-special';
import type { AttributeMap }      from './i-attribute-holder';
import type { builtinAttributes } from './sources/builtin-attributes';

/**
 * Interface describing a holder of attributes
 */
export interface IAttributeHolder {
    readonly attributes: AttributeMap;
}

/**
 * Type matching record of special attributes for an event
 */
export type SpecialAttributeRecord<T extends AttributeReferenceLocalObjectSelector>
    = Record<typeof builtinAttributes[T][number], AttributeSpecial>;

/**
 * Interface describing a holder of special attributes
 */
export interface ISpecialAttributeHolder<T extends AttributeReferenceLocalObjectSelector> {
    readonly specialAttributes: SpecialAttributeRecord<T>;
}
