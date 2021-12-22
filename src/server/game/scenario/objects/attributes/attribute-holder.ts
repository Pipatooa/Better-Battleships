import type { AttributeReferenceLocalObjectSelector } from '../attribute-references/sources/attribute-reference';
import type { AttributeCodeControlled }               from './attribute-code-controlled';
import type { AttributeMap }                          from './i-attribute-holder';
import type { builtinAttributes }                     from './sources/builtin-attributes';

/**
 * Interface describing a holder of attributes
 */
export interface IAttributeHolder {
    readonly attributes: AttributeMap;
}

/**
 * Type matching record of built-in attributes for an event
 */
export type BuiltinAttributeRecord<T extends AttributeReferenceLocalObjectSelector>
    = Record<typeof builtinAttributes[T][number], AttributeCodeControlled>;

/**
 * Interface describing a holder of built-in attributes
 */
export interface IBuiltinAttributeHolder<T extends AttributeReferenceLocalObjectSelector> {
    readonly builtinAttributes: BuiltinAttributeRecord<T>;
}
