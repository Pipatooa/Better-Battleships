import type { GenericEventContext }  from '../../events/event-context';
import type { EventEvaluationState } from '../../events/event-evaluation-state';
import type { AttributeListener }    from '../attribute-listeners/attribute-listener';
import type { Descriptor }           from '../common/descriptor';
import type { IAttributeInfo }       from 'shared/network/scenario/i-attribute-info';

/**
 * Attribute - Server Version
 *
 * Base class for all named values tied to attribute holder objects
 */
export abstract class Attribute {

    private attributeListeners: AttributeListener[] = [];
    private _attributeUpdateCallback: ((newValue: number) => void) | undefined;

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
        const newAttributeListeners: AttributeListener[] = [];

        // Add attribute listeners from old array until priority is lower than priority of new attribute listener
        let i = 0;
        while (i < this.attributeListeners.length) {
            const oldAttributeListener = this.attributeListeners[i++];
            if (oldAttributeListener.priority < attributeListener.priority)
                break;
            newAttributeListeners.push(oldAttributeListener);
        }

        // Add new attribute listener to new array and add final elements of old array
        newAttributeListeners.push(attributeListener);
        while (i < this.attributeListeners.length)
            newAttributeListeners.push(this.attributeListeners[i++]);

        this.attributeListeners = newAttributeListeners;
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
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     * @param  value                New value
     */
    public setValue(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext, value: number): void {
        this._attributeUpdateCallback?.(value);
        for (const attributeListener of this.attributeListeners) {
            attributeListener.onAttributeValueUpdate(eventEvaluationState, {
                builtinAttributes: {}
            }, value);
        }
    }

    /**
     * Getters and setters
     */

    public set attributeUpdateCallback(callback: (newValue: number) => void) {
        this._attributeUpdateCallback = callback;
    }
}
