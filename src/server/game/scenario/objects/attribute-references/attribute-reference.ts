import { attributeReferenceRegex }                          from './sources/attribute-reference';
import type { ECA, ECF, EventContext, GenericEventContext } from '../../events/event-context';
import type {
    AttributeReferenceObjectSelector,
    AttributeReferenceSource,
    AttributeReferenceType
    , AttributeReferenceForeignObjectSelector }             from './sources/attribute-reference';

/**
 * AttributeReference - Server Version
 *
 * Base class for references to attributes
 */
export abstract class AttributeReference {

    /**
     * Deconstructs an attribute reference string into its 3 components
     *
     * @param    attributeReferenceSource Source string
     * @returns                           Array containing sections of string
     */
    protected static deconstructReferenceString(attributeReferenceSource: AttributeReferenceSource): [AttributeReferenceType, AttributeReferenceObjectSelector, string] {
        const matches = attributeReferenceRegex.exec(attributeReferenceSource)!;
        const referenceType = matches[1] as AttributeReferenceType;
        const objectSelector = matches[2] as AttributeReferenceObjectSelector;
        const attributeName = matches[3];
        return [referenceType, objectSelector, attributeName];
    }

    /**
     * Get the value of the referenced attribute
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Value of the referenced attribute
     */
    public abstract getValue(eventContext: GenericEventContext): number;

    /**
     * Set the value of the referenced attribute
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     * @param  value        New value to assign to referenced attribute
     */
    public abstract setValue(eventContext: GenericEventContext, value: number): void;

}
