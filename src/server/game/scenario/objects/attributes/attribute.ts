import type { GenericEventContext } from '../../events/event-context';
import type { AttributeListener }   from '../attribute-listeners/attribute-listener';
import type { Descriptor }          from '../common/descriptor';
import type { IAttributeInfo }      from 'shared/network/scenario/i-attribute-info';

/**
 * Attribute - Server Version
 *
 * Base class for all named values tied to attribute holder objects
 */
export abstract class Attribute {

    private attributeListeners: AttributeListener[] = [];
    protected _attributeUpdateCallbacks: ((newValue: number) => void)[] = [];

    /**
     * Attribute Constructor
     *
     * @param  descriptor Optional descriptor for this attribute
     */
    protected constructor(public readonly descriptor?: Descriptor) {
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that client needs to know.
     *
     * @returns  Created IAttributeInfo object
     */
    public makeTransportable(): IAttributeInfo {
        return {
            descriptor: this.descriptor!.makeTransportable(),
            value: this.getValue()
        };
    }

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
     * @param  value New value
     */
    public setValue(value: number): void {
        for (const callback of this._attributeUpdateCallbacks)
            callback(value);

        const eventContext: GenericEventContext & { value: number } = {
            builtinAttributes: {},
            value: value
        };
        for (const attributeListener of this.attributeListeners)
            attributeListener.onAttributeValueUpdate(eventContext);
    }

    /**
     * Adds a callback which is called when the value of this attribute updates
     *
     * @param  callback Callback to add
     */
    public addAttributeUpdateCallback(callback: (newValue: number) => void): void {
        this._attributeUpdateCallbacks.push(callback);
    }

    /**
     * Removes a callback which is called when the value of this attribute updates
     *
     * @param  callback Callback to remove
     */
    public removeAttributeUpdateCallback(callback: (newValue: number) => void): void {
        this._attributeUpdateCallbacks = this._attributeUpdateCallbacks.filter(c => c !== callback);
    }
}
