import { SubAbilityUsability }                 from 'shared/network/scenario/ability-usability-info';
import { EventRegistrar }                      from '../../events/event-registrar';
import { checkAgainstSchema }                  from '../../schema-checker';
import { getEventListenersFromActionSource }   from '../actions/action-getter';
import { getAttributeListeners }               from '../attribute-listeners/attribute-listener-getter';
import { getAttributes }                       from '../attributes/attribute-getter';
import { Descriptor }                          from '../common/descriptor';
import { RotatablePattern }                    from '../common/rotatable-pattern';
import { buildCondition }                      from '../conditions/condition-builder';
import { Ability }                             from './ability';
import { abilityEventInfo }                    from './events/ability-events';
import { getIconUrlFromSource }                from './icons';
import { PositionedAbility }                   from './positioned-ability';
import { abilityMoveSchema }                   from './sources/ability-move';
import type { ParsingContext }                 from '../../parsing-context';
import type { AttributeListener }              from '../attribute-listeners/attribute-listener';
import type { BuiltinAttributeRecord }         from '../attributes/attribute-holder';
import type { AttributeMap }                   from '../attributes/i-attribute-holder';
import type { PatternEntry }                   from '../common/pattern';
import type { Condition }                      from '../conditions/condition';
import type { Ship }                           from '../ship';
import type { AbilityEvent, AbilityEventInfo } from './events/ability-events';
import type { IAbilityMoveSource }             from './sources/ability-move';
import type { IAbilityMoveInfo }               from 'shared/network/scenario/ability-info';
import type { IAbilityMoveUsabilityInfo }      from 'shared/network/scenario/ability-usability-info';
import type { Rotation }                       from 'shared/scenario/rotation';

/**
 * AbilityFire - Server Version
 *
 * Ability which moves a ship upon its use
 */
export class AbilityMove extends PositionedAbility {

    /**
     * AbilityFire constructor
     *
     * @param  ship               Parent ship which this ability belongs to
     * @param  descriptor         Descriptor for ability
     * @param  icon               Url to icon for this ability
     * @param  pattern            Pattern describing possible movements
     * @param  condition          Condition which must hold true to be able to use this action
     * @param  eventRegistrar     Registrar of all ability event listeners
     * @param  attributes         Attributes for the ability
     * @param  builtinAttributes  Built-in attributes for the ability
     * @param  attributeListeners Attribute listeners for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       icon: string,
                       private pattern: RotatablePattern,
                       condition: Condition,
                       eventRegistrar: EventRegistrar<AbilityEventInfo, AbilityEvent>,
                       attributes: AttributeMap,
                       builtinAttributes: BuiltinAttributeRecord<'ability'>,
                       attributeListeners: AttributeListener[]) {
        super(ship, descriptor, icon, condition, eventRegistrar, attributes, builtinAttributes, attributeListeners);
    }

    /**
     * Factory function to generate AbilityFire from JSON scenario data
     *
     * @param    parsingContext    Context for resolving scenario data
     * @param    abilityMoveSource JSON data for AbilityFire
     * @param    checkSchema       When true, validates source JSON data against schema
     * @returns                    Created AbilityFire object
     */
    public static async fromSource(parsingContext: ParsingContext, abilityMoveSource: IAbilityMoveSource, checkSchema: boolean): Promise<AbilityMove> {

        // Validate JSON data against schema
        if (checkSchema)
            abilityMoveSource = await checkAgainstSchema(abilityMoveSource, abilityMoveSchema, parsingContext);

        // Ability and EventRegistrar partials refer to future Ability and EventRegistrar objects
        const abilityPartial: Partial<Ability> = Object.create(AbilityMove.prototype);
        const eventRegistrarPartial = Object.create(EventRegistrar.prototype) as EventRegistrar<AbilityEventInfo, AbilityEvent>;

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), abilityMoveSource.attributes, 'ability');
        const builtinAttributes = Ability.generateBuiltinAttributes(abilityPartial as Ability);
        parsingContext.localAttributes.ability = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), abilityMoveSource.attributeListeners, eventRegistrarPartial);
        parsingContext.reducePath();

        // Get component elements from source
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), abilityMoveSource.descriptor, false);
        parsingContext.reducePath();
        const icon = getIconUrlFromSource(parsingContext.withExtendedPath('.icon'), abilityMoveSource.icon);
        parsingContext.reducePath();
        const pattern = await RotatablePattern.fromSource(parsingContext.withExtendedPath('.pattern'), abilityMoveSource.pattern, false);
        parsingContext.reducePath();
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityMoveSource.condition, false);
        parsingContext.reducePath();
        const eventListeners = await getEventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), abilityEventInfo, abilityMoveSource.actions);
        parsingContext.reducePath();

        // Return created AbilityMove object
        parsingContext.localAttributes.ability = undefined;
        EventRegistrar.call(eventRegistrarPartial, eventListeners, []);
        AbilityMove.call(abilityPartial, parsingContext.shipPartial as Ship, descriptor, icon, pattern, condition, eventRegistrarPartial, attributes, builtinAttributes, attributeListeners);
        return abilityPartial as AbilityMove;
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @param    includeSubAbilityDetails Whether to include details about which sub-abilities are usable
     * @returns                           Created IAbilityMoveInfo object
     */
    public makeTransportable(includeSubAbilityDetails: boolean): IAbilityMoveInfo {
        return {
            type: 'move',
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
     * @returns                           Created IAbilityMoveUsabilityInfo object
     */
    public getFullUsability(includeSubAbilityDetails: boolean): IAbilityMoveUsabilityInfo {
        return {
            usable: this._usable,
            pattern: this.pattern.makeTransportable(includeSubAbilityDetails)
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
        let subAbilityUsabilityUpdated = false;

        // Create a new pattern indexing validity of moves
        const newPatternEntries: PatternEntry[] = [];
        for (const [x, y, oldValidity] of this.pattern.patternEntries) {
            const dx = x - this.pattern.integerCenter[0];
            const dy = y - this.pattern.integerCenter[1];
            const newValidity = this.ship.canMoveBy(dx, dy) ? SubAbilityUsability.Valid : SubAbilityUsability.Invalid;
            if (newValidity !== oldValidity)
                subAbilityUsabilityUpdated = true;
            newPatternEntries.push([x, y, newValidity]);
        }

        // Update pattern if changes occurred
        if (subAbilityUsabilityUpdated)
            this.pattern = new RotatablePattern(newPatternEntries, this.pattern.center, this.pattern.rotationalCenter, this.pattern.integerCenter);

        return [mainUsabilityUpdated, subAbilityUsabilityUpdated];
    }

    /**
     * Called when the ship that this ability is attached to rotates
     *
     * @param  rotation Amount the ship was rotated by
     */
    public onShipRotate(rotation: Rotation): void {
        this.pattern = this.pattern.rotated(rotation);
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  dx Horizontal amount to move
     * @param  dy Vertical amount to move
     */
    public use(dx: number, dy: number): void {
        if (!this._usable)
            return;

        // Check that the movement is allowed
        const patternX = dx + this.pattern.integerCenter[0];
        const patternY = dy + this.pattern.integerCenter[1];
        if (this.pattern.query(patternX, patternY) !== SubAbilityUsability.Valid)
            return;

        this.ship.moveBy(dx, dy);

        this.eventRegistrar.queueEvent('onUse', {
            builtinAttributes: {},
            locations: {}
        });

        this.eventRegistrar.evaluateEvents();
    }
}
