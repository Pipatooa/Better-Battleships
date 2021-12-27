import type { AbilityInfo }                               from '../../../../../shared/network/scenario/ability-info';
import type { EventContextForEvent, GenericEventContext } from '../../events/event-context';
import type { EventRegistrar }                            from '../../events/event-registrar';
import type { AttributeListener }                         from '../attribute-listeners/attribute-listener';
import type { IAttributeHolder, BuiltinAttributeRecord }  from '../attributes/attribute-holder';
import type { AttributeMap }                              from '../attributes/i-attribute-holder';
import type { Descriptor }                                from '../common/descriptor';
import type { Condition }                                 from '../conditions/condition';
import type { Ship }                                      from '../ship';
import type { AbilityEvent, AbilityEventInfo }            from './events/ability-events';

/**
 * Ability - Server Version
 *
 * Base class for abilities of a ship which execute actions upon use
 */
export abstract class Ability implements IAttributeHolder, BuiltinAttributeRecord<'ability'> {

    protected usable: boolean | undefined;

    /**
     * Ability constructor
     *
     * @param  ship               Parent ship which this ability belongs to
     * @param  descriptor         Descriptor for ability
     * @param  condition          Condition which must hold true to be able to use this ability
     * @param  eventRegistrar     Registrar of all team event listeners
     * @param  attributes         Attributes for the ability
     * @param  builtinAttributes  Built-in attributes for the ability
     * @param  attributeListeners Attribute listeners for the ability
     */
    public constructor(public readonly ship: Ship,
                       public readonly descriptor: Descriptor,
                       public readonly condition: Condition,
                       public readonly eventRegistrar: EventRegistrar<AbilityEventInfo, AbilityEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly builtinAttributes: BuiltinAttributeRecord<'ability'>,
                       private readonly attributeListeners: AttributeListener[]) {

        const listenerCallback = (eventContext: EventContextForEvent<AbilityEventInfo, AbilityEvent, 'onAbilityUsed'>): void => this.checkUsable(eventContext);
        this.eventRegistrar.addEventListener('onAbilityUsed', [10, listenerCallback]);
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        for (const attributeListener of this.attributeListeners)
            attributeListener.unregister();
        this.eventRegistrar.detach();
    }

    /**
     * Registers all attribute listeners for this object and all sub-objects
     */
    public registerAttributeListeners(): void {
        for (const attributeListener of this.attributeListeners)
            attributeListener.register();
    }

    /**
     * Generates built-in attributes for Ability object
     *
     * @param    object Object to generate built-in attributes for
     * @returns         Record of built-in attributes for the object
     */
    protected static generateBuiltinAttributes(object: Ability): BuiltinAttributeRecord<'ability'> {
        return {};
    }

    /**
     * Checks whether or not this ability is usable
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Whether or not this ability is usable
     */
    public checkUsable(eventContext: GenericEventContext): void {
        this.usable = this.condition.check(eventContext);
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created AbilityInfo object
     */
    public abstract makeTransportable(): AbilityInfo;
}
