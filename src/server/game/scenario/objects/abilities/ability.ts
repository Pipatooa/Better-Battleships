import { AttributeWatcher }                              from '../attributes/attribute-watcher';
import type { EventRegistrar }                           from '../../events/event-registrar';
import type { AttributeListener }                        from '../attribute-listeners/attribute-listener';
import type { IAttributeHolder, BuiltinAttributeRecord } from '../attributes/attribute-holder';
import type { AttributeMap }                             from '../attributes/i-attribute-holder';
import type { Descriptor }                               from '../common/descriptor';
import type { Condition }                                from '../conditions/condition';
import type { Ship }                                     from '../ship';
import type { AbilityEvent, AbilityEventInfo }           from './events/ability-events';
import type { AbilityInfo }                              from 'shared/network/scenario/ability-info';

/**
 * Ability - Server Version
 *
 * Base class for abilities of a ship which execute actions upon use
 */
export abstract class Ability implements IAttributeHolder, BuiltinAttributeRecord<'ability'> {

    protected usable = false;
    public readonly attributeWatcher: AttributeWatcher;

    /**
     * Ability constructor
     *
     * @param  ship               Parent ship which this ability belongs to
     * @param  descriptor         Descriptor for ability
     * @param  icon               Url to icon for this ability
     * @param  condition          Condition which must hold true to be able to use this ability
     * @param  eventRegistrar     Registrar of all team event listeners
     * @param  attributes         Attributes for the ability
     * @param  builtinAttributes  Built-in attributes for the ability
     * @param  attributeListeners Attribute listeners for the ability
     */
    public constructor(public readonly ship: Ship,
                       public readonly descriptor: Descriptor,
                       protected readonly icon: string,
                       public readonly condition: Condition,
                       public readonly eventRegistrar: EventRegistrar<AbilityEventInfo, AbilityEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly builtinAttributes: BuiltinAttributeRecord<'ability'>,
                       private readonly attributeListeners: AttributeListener[]) {

        this.attributeWatcher = new AttributeWatcher(this.attributes, this.builtinAttributes);
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        for (const attributeListener of this.attributeListeners)
            attributeListener.unregister();
        this.eventRegistrar.deactivate();
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
     * Checks whether this ability is usable
     *
     * @returns  [usable, oldUsability]
     */
    public checkUsable(): [boolean, boolean] {
        const oldUsability = this.usable;
        this.usable = this.condition.check({
            builtinAttributes: {}
        });
        return [this.usable, oldUsability];
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
