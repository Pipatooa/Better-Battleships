import { Rotation }                            from 'shared/scenario/objects/common/rotation';
import { EventRegistrar }                      from '../../events/event-registrar';
import { checkAgainstSchema }                  from '../../schema-checker';
import { eventListenersFromActionSource }      from '../actions/action-getter';
import { getAttributeListeners }               from '../attribute-listeners/attribute-listener-getter';
import { getAttributes }                       from '../attributes/attribute-getter';
import { Descriptor }                          from '../common/descriptor';
import { buildCondition }                      from '../conditions/condition-builder';
import { Ability }                             from './ability';
import { abilityEventInfo }                    from './events/ability-events';
import { IndexedAbility }                      from './indexed-ability';
import { abilityRotateSchema }                 from './sources/ability-rotate';
import type { IAbilityRotateInfo }             from '../../../../../shared/network/scenario/ability-info';
import type { ParsingContext }                 from '../../parsing-context';
import type { AttributeListener }              from '../attribute-listeners/attribute-listener';
import type { BuiltinAttributeRecord }         from '../attributes/attribute-holder';
import type { AttributeMap }                   from '../attributes/i-attribute-holder';
import type { Condition }                      from '../conditions/condition';
import type { Ship }                           from '../ship';
import type { AbilityEvent, AbilityEventInfo } from './events/ability-events';
import type { IAbilityRotateSource }           from './sources/ability-rotate';

/**
 * AbilityFire - Server Version
 *
 * Ability which rotates a ship upon its use
 */
export class AbilityRotate extends IndexedAbility {

    /**
     * AbilityFire constructor
     *
     * @param  ship               Parent ship which this ability belongs to
     * @param  descriptor         Descriptor for ability
     * @param  rot90allowed       Whether or not a rotation by 90 degrees is allowed
     * @param  rot180allowed      Whether or not a rotation by 180 degrees is allowed
     * @param  rot270allowed      Whether or not a rotation by 270 degrees is allowed
     * @param  condition          Condition which must hold true to be able to use this action
     * @param  eventRegistrar     Registrar of all ability event listeners
     * @param  attributes         Attributes for the ability
     * @param  builtinAttributes  Built-in attributes for the ability
     * @param  attributeListeners Attribute listeners for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       public readonly rot90allowed: boolean,
                       public readonly rot180allowed: boolean,
                       public readonly rot270allowed: boolean,
                       condition: Condition,
                       eventRegistrar: EventRegistrar<AbilityEventInfo, AbilityEvent>,
                       attributes: AttributeMap,
                       builtinAttributes: BuiltinAttributeRecord<'ability'>,
                       attributeListeners: AttributeListener[]) {
        super(ship, descriptor, condition, eventRegistrar, attributes, builtinAttributes, attributeListeners);
    }

    /**
     * Factory function to generate AbilityFire from JSON scenario data
     *
     * @param    parsingContext      Context for resolving scenario data
     * @param    abilityRotateSource JSON data for AbilityFire
     * @param    checkSchema         When true, validates source JSON data against schema
     * @returns                      Created AbilityFire object
     */
    public static async fromSource(parsingContext: ParsingContext, abilityRotateSource: IAbilityRotateSource, checkSchema: boolean): Promise<AbilityRotate> {

        // Validate JSON data against schema
        if (checkSchema)
            abilityRotateSource = await checkAgainstSchema(abilityRotateSource, abilityRotateSchema, parsingContext);
        
        // Ability partial refers to future Ability object
        const abilityPartial: Partial<Ability> = Object.create(AbilityRotate.prototype);
        
        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), abilityRotateSource.attributes, 'ability');
        const builtinAttributes = Ability.generateBuiltinAttributes(abilityPartial as Ability);
        parsingContext.localAttributes.ability = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), abilityRotateSource.attributeListeners);
        parsingContext.reducePath();

        // Get component elements from source
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), abilityRotateSource.descriptor, false);
        parsingContext.reducePath();
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityRotateSource.condition, false);
        parsingContext.reducePath();
        const eventListeners = await eventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), abilityEventInfo, abilityRotateSource.actions);
        parsingContext.reducePath();

        // Return created AbilityFire object
        parsingContext.localAttributes.ability = undefined;
        const eventRegistrar = new EventRegistrar(eventListeners, []);
        AbilityRotate.call(abilityPartial, parsingContext.shipPartial as Ship, descriptor, abilityRotateSource.rot90, abilityRotateSource.rot180, abilityRotateSource.rot270, condition, eventRegistrar, attributes, builtinAttributes, attributeListeners);
        return abilityPartial as AbilityRotate;
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  rotation Rotation to apply to ship
     */
    public use(rotation: Rotation): void {

        if (!this.usable!)
            return;

        const rotationAllowed =
            rotation === Rotation.Clockwise90 && this.rot90allowed ||
            rotation === Rotation.Clockwise180 && this.rot180allowed ||
            rotation === Rotation.Clockwise270 && this.rot270allowed;

        if (!rotationAllowed)
            return;

        if (!this.ship.tryRotateBy(rotation))
            return;

        this.eventRegistrar.triggerEvent('onUse', {
            builtinAttributes: {},
            foreignTeam: this.ship.owner.team,
            foreignPlayer: this.ship.owner,
            foreignShip: this.ship,
            foreignAbility: this
        });
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created AbilityInfo object
     */
    public makeTransportable(): IAbilityRotateInfo {
        return {
            type: 'rotate',
            descriptor: this.descriptor.makeTransportable(),
            rot90: this.rot90allowed,
            rot180: this.rot180allowed,
            rot270: this.rot270allowed
        };
    }
}
