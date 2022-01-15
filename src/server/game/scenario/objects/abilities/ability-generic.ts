import { EventRegistrar }                      from '../../events/event-registrar';
import { checkAgainstSchema }                  from '../../schema-checker';
import { getEventListenersFromActionSource }   from '../actions/action-getter';
import { getAttributeListeners }               from '../attribute-listeners/attribute-listener-getter';
import { getAttributes }                       from '../attributes/attribute-getter';
import { Descriptor }                          from '../common/descriptor';
import { buildCondition }                      from '../conditions/condition-builder';
import { Ability }                             from './ability';
import { abilityEventInfo }                    from './events/ability-events';
import { getIconUrlFromSource }                from './icons';
import { IndexedAbility }                      from './indexed-ability';
import { abilityGenericSchema }                from './sources/ability-generic';
import type { ParsingContext }                 from '../../parsing-context';
import type { AttributeListener }              from '../attribute-listeners/attribute-listener';
import type { BuiltinAttributeRecord }         from '../attributes/attribute-holder';
import type { AttributeMap }                   from '../attributes/i-attribute-holder';
import type { Condition }                      from '../conditions/condition';
import type { Scenario }                       from '../scenario';
import type { Ship }                           from '../ship';
import type { AbilityEvent, AbilityEventInfo } from './events/ability-events';
import type { IAbilityGenericSource }          from './sources/ability-generic';
import type { IAbilityGenericInfo }            from 'shared/network/scenario/ability-info';
import type { IAbilityGenericUsabilityInfo }   from 'shared/network/scenario/ability-usability-info';

/**
 * AbilityGeneric - Server Version
 *
 * Ability which moves a ship upon its use
 */
export class AbilityGeneric extends IndexedAbility {

    /**
     * AbilityGeneric constructor
     *
     * @param  ship               Parent ship which this ability belongs to
     * @param  descriptor         Descriptor for ability
     * @param  icon               Url to icon for this ability
     * @param  condition          Condition which must hold true to be able to use this action
     * @param  buttonText         Text which appears on the button to use the ability
     * @param  eventRegistrar     Registrar of all ability event listeners
     * @param  attributes         Attributes for the ability
     * @param  builtinAttributes  Built-in attributes for the ability
     * @param  attributeListeners Attribute listeners for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       icon: string,
                       condition: Condition,
                       private readonly buttonText: string,
                       eventRegistrar: EventRegistrar<AbilityEventInfo, AbilityEvent>,
                       attributes: AttributeMap,
                       builtinAttributes: BuiltinAttributeRecord<'ability'>,
                       attributeListeners: AttributeListener[]) {
        super(ship, descriptor, icon, condition, eventRegistrar, attributes, builtinAttributes, attributeListeners);
    }

    /**
     * Factory function to generate AbilityGeneric from JSON scenario data
     *
     * @param    parsingContext       Context for resolving scenario data
     * @param    abilityGenericSource JSON data for AbilityGeneric
     * @param    checkSchema          When true, validates source JSON data against schema
     * @returns                       Created AbilityGeneric object
     */
    public static async fromSource(parsingContext: ParsingContext, abilityGenericSource: IAbilityGenericSource, checkSchema: boolean): Promise<AbilityGeneric> {

        // Validate JSON data against schema
        if (checkSchema)
            abilityGenericSource = await checkAgainstSchema(abilityGenericSource, abilityGenericSchema, parsingContext);

        // Ability and EventRegistrar partials refer to future Ability and EventRegistrar objects
        const abilityPartial: Partial<Ability> = Object.create(AbilityGeneric.prototype);
        const eventRegistrarPartial = Object.create(EventRegistrar.prototype) as EventRegistrar<AbilityEventInfo, AbilityEvent>;

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), abilityGenericSource.attributes, 'ability');
        const builtinAttributes = Ability.generateBuiltinAttributes(abilityPartial as Ability);
        parsingContext.localAttributes.ability = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), abilityGenericSource.attributeListeners, eventRegistrarPartial);
        parsingContext.reducePath();

        // Get component elements from source
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), abilityGenericSource.descriptor, false);
        parsingContext.reducePath();
        const icon = getIconUrlFromSource(parsingContext.withExtendedPath('.icon'), abilityGenericSource.icon);
        parsingContext.reducePath();
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityGenericSource.condition, false);
        parsingContext.reducePath();
        const eventListeners = await getEventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), abilityEventInfo, abilityGenericSource.actions);
        parsingContext.reducePath();

        // Return created AbilityGeneric object
        parsingContext.localAttributes.ability = undefined;
        EventRegistrar.call(eventRegistrarPartial, parsingContext.scenarioPartial as Scenario, eventListeners, []);
        AbilityGeneric.call(abilityPartial, parsingContext.shipPartial as Ship, descriptor, icon, condition, abilityGenericSource.buttonText, eventRegistrarPartial, attributes, builtinAttributes, attributeListeners);
        return abilityPartial as AbilityGeneric;
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created IAbilityMoveInfo object
     */
    public makeTransportable(): IAbilityGenericInfo {
        return {
            type: 'generic',
            descriptor: this.descriptor.makeTransportable(),
            icon: this.icon,
            attributes: this.attributeWatcher.exportAttributeInfo(),
            buttonText: this.buttonText,
            usability: this.getFullUsability()
        };
    }

    /**
     * Returns an object describing the usability of this ability and its sub-abilities
     *
     * @returns  Created IAbilityMoveUsabilityInfo object
     */
    public getFullUsability(): IAbilityGenericUsabilityInfo {
        return {
            usable: this._usable
        };
    }

    /**
     * Checks whether this ability and its sub-abilities are usable
     *
     * @returns  [Main ability usability updated, Sub-ability usability updated]
     */
    public checkUsable(): [mainUsabilityUpdated: boolean, subAbilityUsabilityUpdated: boolean] {
        const oldUsability = this._usable;
        this._usable = this.condition.check({
            builtinAttributes: {},
            locations: {}
        });

        const mainUsabilityUpdated = this._usable !== oldUsability;
        return [mainUsabilityUpdated, false];
    }

    /**
     * Called when the ship that this ability is attached to rotates
     */
    public onShipRotate(): void {}

    /**
     * Execute actions related to this ability if the ability's condition is met
     */
    public use(): void {
        if (!this._usable)
            return;

        this.eventRegistrar.queueEvent('onUse', {
            builtinAttributes: {},
            locations: {}
        });

        this.eventRegistrar.evaluateEvents();
    }
}
