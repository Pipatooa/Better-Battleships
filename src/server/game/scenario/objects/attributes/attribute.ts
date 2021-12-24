import type { GenericEventContext } from '../../events/event-context';
import type { AttributeListener }   from '../attribute-listeners/attribute-listener';

/**
 * Attribute - Server Version
 *
 * Base class for all named values tied to attribute holder objects
 */
export abstract class Attribute {

    private attributeListeners: AttributeListener[] = [];

    /**
     * Register an attribute listener for this attribute
     *
     * @param  attributeListener Attribute listener to register
     */
    public registerAttributeListener(attributeListener: AttributeListener): void {
        this.attributeListeners.push(attributeListener);
    }

    /**
     * Unregisters an attribute listeners attached to this attribute
     *
     * @param  attributeListener Attribute listeners to unregister
     */
    public unregisterAttributeListener(attributeListener: AttributeListener): void {
        this.attributeListeners = this.attributeListeners.filter(l => l !== attributeListener);
    }

    /**
     * Get the value of this attribute
     *
     * @returns  Value of this attribute
     */
    public abstract getValue(): number;

    /**
     * Set the value of this attribute
     *
     * Will constrain given value to meet all held value constraints.
     * If attribute is readonly, new value will be ignored
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     * @param  value        New value
     */
    public setValue(eventContext: GenericEventContext, value: number): void {
        for (const attributeListener of this.attributeListeners) {
            attributeListener.onAttributeValueUpdate({
                builtinAttributes: {}
            }, value);
        }
    }
}
