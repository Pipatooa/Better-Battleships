import { SubAbilityUsability }                 from 'shared/network/scenario/ability-usability-info';
import { Rotation }                            from 'shared/scenario/rotation';
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
import { abilityRotateSchema }                 from './sources/ability-rotate';
import type { ParsingContext }                 from '../../parsing-context';
import type { AttributeListener }              from '../attribute-listeners/attribute-listener';
import type { BuiltinAttributeRecord }         from '../attributes/attribute-holder';
import type { AttributeMap }                   from '../attributes/i-attribute-holder';
import type { Condition }                      from '../conditions/condition';
import type { Scenario }                       from '../scenario';
import type { Ship }                           from '../ship';
import type { AbilityEvent, AbilityEventInfo } from './events/ability-events';
import type { IAbilityRotateSource }           from './sources/ability-rotate';
import type { IAbilityRotateInfo }             from 'shared/network/scenario/ability-info';
import type { IAbilityRotateUsabilityInfo }    from 'shared/network/scenario/ability-usability-info';

/**
 * AbilityRotate - Server Version
 *
 * Ability which rotates a ship upon its use
 */
export class AbilityRotate extends IndexedAbility {

    private rot90valid: SubAbilityUsability;
    private rot180valid: SubAbilityUsability;
    private rot270valid: SubAbilityUsability;

    /**
     * AbilityRotate constructor
     *
     * @param  ship               Parent ship which this ability belongs to
     * @param  descriptor         Descriptor for ability
     * @param  icon               Url to icon for this ability
     * @param  condition          Condition which must hold true to be able to use this action
     * @param  rot90allowed       Whether a rotation by 90 degrees is allowed
     * @param  rot180allowed      Whether a rotation by 180 degrees is allowed
     * @param  rot270allowed      Whether a rotation by 270 degrees is allowed
     * @param  eventRegistrar     Registrar of all ability event listeners
     * @param  attributes         Attributes for the ability
     * @param  builtinAttributes  Built-in attributes for the ability
     * @param  attributeListeners Attribute listeners for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       icon: string,
                       condition: Condition,
                       rot90allowed: boolean,
                       rot180allowed: boolean,
                       rot270allowed: boolean,
                       eventRegistrar: EventRegistrar<AbilityEventInfo, AbilityEvent>,
                       attributes: AttributeMap,
                       builtinAttributes: BuiltinAttributeRecord<'ability'>,
                       attributeListeners: AttributeListener[]) {
        super(ship, descriptor, icon, condition, eventRegistrar, attributes, builtinAttributes, attributeListeners);
        this.rot90valid = rot90allowed ? SubAbilityUsability.Unknown : SubAbilityUsability.NotUsable;
        this.rot180valid = rot180allowed ? SubAbilityUsability.Unknown : SubAbilityUsability.NotUsable;
        this.rot270valid = rot270allowed ? SubAbilityUsability.Unknown : SubAbilityUsability.NotUsable;
    }

    /**
     * Factory function to generate AbilityRotate from JSON scenario data
     *
     * @param    parsingContext      Context for resolving scenario data
     * @param    abilityRotateSource JSON data for AbilityRotate
     * @param    checkSchema         When true, validates source JSON data against schema
     * @returns                      Created AbilityRotate object
     */
    public static async fromSource(parsingContext: ParsingContext, abilityRotateSource: IAbilityRotateSource, checkSchema: boolean): Promise<AbilityRotate> {

        // Validate JSON data against schema
        if (checkSchema)
            abilityRotateSource = await checkAgainstSchema(abilityRotateSource, abilityRotateSchema, parsingContext);

        // Ability and EventRegistrar partials refer to future Ability and EventRegistrar objects
        const abilityPartial: Partial<Ability> = Object.create(AbilityRotate.prototype);
        const eventRegistrarPartial = Object.create(EventRegistrar.prototype) as EventRegistrar<AbilityEventInfo, AbilityEvent>;

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), abilityRotateSource.attributes, 'ability');
        const builtinAttributes = Ability.generateBuiltinAttributes(abilityPartial as Ability);
        parsingContext.localAttributes.ability = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), abilityRotateSource.attributeListeners, eventRegistrarPartial);
        parsingContext.reducePath();

        // Get component elements from source
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), abilityRotateSource.descriptor, false);
        parsingContext.reducePath();
        const icon = getIconUrlFromSource(parsingContext.withExtendedPath('.icon'), abilityRotateSource.icon);
        parsingContext.reducePath();
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityRotateSource.condition, false);
        parsingContext.reducePath();
        const eventListeners = await getEventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), abilityEventInfo, abilityRotateSource.actions);
        parsingContext.reducePath();

        // Return created AbilityRotate object
        parsingContext.localAttributes.ability = undefined;
        EventRegistrar.call(eventRegistrarPartial, parsingContext.scenarioPartial as Scenario, eventListeners, []);
        AbilityRotate.call(abilityPartial, parsingContext.shipPartial as Ship, descriptor, icon, condition, abilityRotateSource.rot90, abilityRotateSource.rot180, abilityRotateSource.rot270, eventRegistrarPartial, attributes, builtinAttributes, attributeListeners);
        return abilityPartial as AbilityRotate;
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @param    includeSubAbilityDetails Whether to include details about which sub-abilities are usable
     * @returns                           Created IAbilityRotateInfo object
     */
    public makeTransportable(includeSubAbilityDetails: boolean): IAbilityRotateInfo {
        return {
            type: 'rotate',
            descriptor: this.descriptor.makeTransportable(),
            icon: this.icon,
            attributes: this.attributeWatcher.exportAttributeInfo(),
            usability: this.getFullUsability(includeSubAbilityDetails)
        };
    }

    /**
     * Returns an object describing the usability of this ability and its sub-abilities
     *
     * @param    includeSubAbilityDetails Whether to include details about which sub-abilities are usable
     * @returns                           Created IAbilityRotateUsabilityInfo object
     */
    public getFullUsability(includeSubAbilityDetails: boolean): IAbilityRotateUsabilityInfo {
        return {
            usable: this._usable,
            rotations: [
                // Limit sub-ability usability details to NotUsable or Unknown if includeSubAbilityDetails is false
                this.rot90valid <= SubAbilityUsability.Unknown || includeSubAbilityDetails ? this.rot90valid : SubAbilityUsability.Unknown,
                this.rot180valid <= SubAbilityUsability.Unknown || includeSubAbilityDetails ? this.rot180valid : SubAbilityUsability.Unknown,
                this.rot270valid <= SubAbilityUsability.Unknown || includeSubAbilityDetails ? this.rot270valid : SubAbilityUsability.Unknown
            ]
        };
    }

    /**
     * Checks whether this ability and its sub-abilities are usable
     *
     * @returns  [Main ability usability updated, Sub-ability usability updated]
     */
    public checkUsable(): [mainUsabilityUpdated: boolean, subAbilityUsabilityUpdated: boolean] {
        const oldUsability = this._usable;
        const oldRot90Valid = this.rot90valid;
        const oldRot180Valid = this.rot180valid;
        const oldRot270Valid = this.rot270valid;

        this._usable = this.condition.check({
            builtinAttributes: {},
            locations: {}
        });

        if (this.rot90valid !== SubAbilityUsability.NotUsable)
            this.rot90valid = this.ship.canRotateBy(Rotation.Clockwise90) ? SubAbilityUsability.Valid : SubAbilityUsability.Invalid;
        if (this.rot180valid !== SubAbilityUsability.NotUsable)
            this.rot180valid = this.ship.canRotateBy(Rotation.Clockwise180) ? SubAbilityUsability.Valid : SubAbilityUsability.Invalid;
        if (this.rot270valid !== SubAbilityUsability.NotUsable)
            this.rot270valid = this.ship.canRotateBy(Rotation.Clockwise270) ? SubAbilityUsability.Valid : SubAbilityUsability.Invalid;

        const mainUsabilityUpdated = this._usable !== oldUsability;
        const subAbilityUsabilityUpdated =
            this.rot90valid !== oldRot90Valid ||
            this.rot180valid !== oldRot180Valid ||
            this.rot270valid !== oldRot270Valid;

        return [mainUsabilityUpdated, subAbilityUsabilityUpdated];
    }

    /**
     * Called when the ship that this ability is attached to rotates
     */
    public onShipRotate(): void {}

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  rotation Rotation to apply to ship
     */
    public use(rotation: Rotation): void {
        if (!this._usable)
            return;

        const rotationAllowed =
            rotation === Rotation.Clockwise90 && this.rot90valid === SubAbilityUsability.Valid ||
            rotation === Rotation.Clockwise180 && this.rot180valid === SubAbilityUsability.Valid ||
            rotation === Rotation.Clockwise270 && this.rot270valid === SubAbilityUsability.Valid;

        if (!rotationAllowed)
            return;

        this.ship.rotateBy(rotation);

        this.eventRegistrar.queueEvent('onUse', {
            builtinAttributes: {},
            locations: {}
        });

        this.eventRegistrar.evaluateEvents();
    }
}
