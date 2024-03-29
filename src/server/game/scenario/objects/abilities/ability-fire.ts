import { SubAbilityUsability }                         from 'shared/network/scenario/ability-usability-info';
import { EventRegistrar }                              from '../../events/event-registrar';
import { checkAgainstSchema }                          from '../../schema-checker';
import { getEventListenersFromActionSource }           from '../actions/action-getter';
import { getAttributeListeners }                       from '../attribute-listeners/attribute-listener-getter';
import { AttributeCodeControlled }                     from '../attributes/attribute-code-controlled';
import { getAttributes }                               from '../attributes/attribute-getter';
import { Descriptor }                                  from '../common/descriptor';
import { RotatablePattern }                            from '../common/rotatable-pattern';
import { buildCondition }                              from '../conditions/condition-builder';
import { Ability }                                     from './ability';
import { abilityFireEventInfo }                        from './events/ability-fire-events';
import { getIconUrlFromSource }                        from './icons';
import { PositionedAbility }                           from './positioned-ability';
import { abilityFireSchema }                           from './sources/ability-fire';
import type { ParsingContext }                         from '../../parsing-context';
import type { AttributeListener }                      from '../attribute-listeners/attribute-listener';
import type { BuiltinAttributeRecord }                 from '../attributes/attribute-holder';
import type { AttributeMap }                           from '../attributes/i-attribute-holder';
import type { PatternEntry }                           from '../common/pattern';
import type { Condition }                              from '../conditions/condition';
import type { Scenario }                               from '../scenario';
import type { Ship }                                   from '../ship';
import type { AbilityFireEvent, AbilityFireEventInfo } from './events/ability-fire-events';
import type { IAbilityFireSource }                     from './sources/ability-fire';
import type { IAbilityFireInfo }                       from 'shared/network/scenario/ability-info';
import type { IAbilityFireUsabilityInfo }              from 'shared/network/scenario/ability-usability-info';
import type { Rotation }                               from 'shared/scenario/rotation';

/**
 * AbilityFire - Server Version
 *
 * Ability which acts upon a selected group of cells upon its use
 */
export class AbilityFire extends PositionedAbility {

    public readonly eventRegistrar: EventRegistrar<AbilityFireEventInfo, AbilityFireEvent>;

    /**
     * AbilityFire constructor
     *
     * @param  ship               Parent ship which this ability belongs to
     * @param  descriptor         Descriptor for ability
     * @param  icon               Url to icon for this ability
     * @param  selectionPattern   Pattern determining which cell can be selected to apply the affect pattern around
     * @param  effectPattern      Pattern determining which cells around the selected cell are affected
     * @param  condition          Condition which must hold true to be able to use this action
     * @param  eventRegistrar     Registrar of all ability event listeners
     * @param  attributes         Attributes for the ability
     * @param  builtinAttributes  Built-in attributes for the ability
     * @param  attributeListeners Attribute listeners for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       icon: string,
                       private selectionPattern: RotatablePattern,
                       private effectPattern: RotatablePattern,
                       condition: Condition,
                       eventRegistrar: EventRegistrar<AbilityFireEventInfo, AbilityFireEvent>,
                       attributes: AttributeMap,
                       builtinAttributes: BuiltinAttributeRecord<'ability'>,
                       attributeListeners: AttributeListener[]) {

        super(ship, descriptor, icon, condition, eventRegistrar, attributes, builtinAttributes, attributeListeners);
        this.eventRegistrar = eventRegistrar;
    }

    /**
     * Factory function to generate AbilityFire from JSON scenario data
     *
     * @param    parsingContext    Context for resolving scenario data
     * @param    abilityFireSource JSON data for AbilityFire
     * @param    checkSchema       When true, validates source JSON data against schema
     * @returns                    Created AbilityFire object
     */
    public static async fromSource(parsingContext: ParsingContext, abilityFireSource: IAbilityFireSource, checkSchema: boolean): Promise<AbilityFire> {

        // Validate JSON data against schema
        if (checkSchema)
            abilityFireSource = await checkAgainstSchema(abilityFireSource, abilityFireSchema, parsingContext);

        // Ability and EventRegistrar partials refer to future Ability and EventRegistrar objects
        const abilityPartial: Partial<Ability> = Object.create(AbilityFire.prototype);
        const eventRegistrarPartial = Object.create(EventRegistrar.prototype) as EventRegistrar<AbilityFireEventInfo, AbilityFireEvent>;

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), abilityFireSource.attributes, 'ability');
        const builtinAttributes = Ability.generateBuiltinAttributes(abilityPartial as Ability);
        parsingContext.localAttributes.ability = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), abilityFireSource.attributeListeners, eventRegistrarPartial);
        parsingContext.reducePath();

        // Get component elements from source
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), abilityFireSource.descriptor, false);
        parsingContext.reducePath();
        const icon = getIconUrlFromSource(parsingContext.withExtendedPath('.icon'), abilityFireSource.icon);
        parsingContext.reducePath();
        const selectionPattern = await RotatablePattern.fromSource(parsingContext.withExtendedPath('.selectionPattern'), abilityFireSource.selectionPattern, true, false);
        parsingContext.reducePath();
        const effectPattern = await RotatablePattern.fromSource(parsingContext.withExtendedPath('.effectPattern'), abilityFireSource.effectPattern, false, false);
        parsingContext.reducePath();
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityFireSource.condition, false);
        parsingContext.reducePath();
        const eventListeners = await getEventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), abilityFireEventInfo, abilityFireSource.actions);
        parsingContext.reducePath();

        // Return created AbilityFire object
        parsingContext.localAttributes.ability = undefined;
        EventRegistrar.call(eventRegistrarPartial, parsingContext.scenarioPartial as Scenario, eventListeners, []);
        AbilityFire.call(abilityPartial, parsingContext.shipPartial as Ship, descriptor, icon, selectionPattern, effectPattern, condition, eventRegistrarPartial, attributes, builtinAttributes, attributeListeners);
        return abilityPartial as AbilityFire;
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @param    includeSubAbilityDetails Whether to include details about which sub-abilities are usable
     * @returns                           Created IAbilityFireInfo object
     */
    public makeTransportable(includeSubAbilityDetails: boolean): IAbilityFireInfo {
        return {
            type: 'fire',
            descriptor: this.descriptor.makeTransportable(),
            icon: this.icon,
            effectPattern: this.effectPattern.makeTransportable(false),
            attributes: this.attributeWatcher.exportAttributeInfo(),
            usability: this.getFullUsability(includeSubAbilityDetails)
        };
    }

    /**
     * Returns an object describing the usability of this ability and its sub-abilities
     *
     * @param    includeSubAbilityDetails Whether to include details about which sub-abilities are usable
     * @returns                           Created IAbilityFireUsabilityInfo object
     */
    public getFullUsability(includeSubAbilityDetails: boolean): IAbilityFireUsabilityInfo {
        return {
            usable: this._usable,
            pattern: this.selectionPattern.makeTransportable(includeSubAbilityDetails)
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

        // Create a new pattern indexing validity of firing positions
        // At least one tile of the effect pattern must overlap with the board for a position to be valid
        const newPatternEntries: PatternEntry[] = [];
        for (const [x, y, oldValidity] of this.selectionPattern.patternEntries) {
            const centerX = this.ship.x + x - this.selectionPattern.integerCenter[0] + this.ship.pattern.integerCenter[0];
            const centerY = this.ship.y + y - this.selectionPattern.integerCenter[1] + this.ship.pattern.integerCenter[1];

            let newValidity = SubAbilityUsability.Invalid;
            for (const [dx, dy] of this.effectPattern.patternEntries) {
                const tileX = centerX + dx - this.effectPattern.integerCenter[0];
                const tileY = centerY + dy - this.effectPattern.integerCenter[1];
                const tile = this.ship.board.tiles[tileY]?.[tileX];
                if (tile !== undefined)
                    newValidity = SubAbilityUsability.Valid;
            }
            if (newValidity !== oldValidity)
                subAbilityUsabilityUpdated = true;

            newPatternEntries.push([x, y, newValidity]);
        }

        // Update pattern if changes occurred
        if (subAbilityUsabilityUpdated)
            this.selectionPattern = new RotatablePattern(newPatternEntries, this.selectionPattern.center, this.selectionPattern.rotationalCenter, this.selectionPattern.integerCenter);

        return [mainUsabilityUpdated, subAbilityUsabilityUpdated];
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  dx Horizontal distance from center of ship to fire upon
     * @param  dy Vertical distance from center of ship to fire upon
     */
    public use(dx: number, dy: number): void {
        if (!this._usable)
            return;

        const patternX = dx + this.selectionPattern.integerCenter[0];
        const patternY = dy + this.selectionPattern.integerCenter[1];

        if (this.selectionPattern.query(patternX, patternY) !== SubAbilityUsability.Valid)
            return;

        this.eventRegistrar.queueEvent('onUse', {
            builtinAttributes: {},
            locations: {}
        });

        // Container to act as persistent reference to hitCount so events raised refer to final hit count
        const hitCountContainer = { hitCount: 0 };
        const hitCountAttribute = new AttributeCodeControlled(undefined, true, () => hitCountContainer.hitCount, () => {});

        const centerX = dx + this.ship.x + this.ship.pattern.integerCenter[0];
        const centerY = dy + this.ship.y + this.ship.pattern.integerCenter[1];

        // Create onHit event for every ship within effect pattern
        for (const [x, y, v] of this.effectPattern.patternEntries) {
            const tileX = centerX + x - this.effectPattern.integerCenter[0];
            const tileY = centerY + y - this.effectPattern.integerCenter[1];
            const tile = this.ship.board.tiles[tileY]?.[tileX];
            const ship = tile?.[2];
            if (ship === undefined) {

                // Event for every missed tile
                this.eventRegistrar.queueEvent('onMiss', {
                    builtinAttributes: {
                        patternValue: new AttributeCodeControlled(undefined, true, () => v, () => {}),
                        hitCount: hitCountAttribute
                    },
                    locations: {
                        tile: [[x, y]]
                    }
                });
                continue;
            }

            const isThis = this.ship === ship ? 1 : 0;
            const isFriendly = this.ship.owner.team === ship.owner.team ? 1 : 0;
            const isVisible = ship.getTrackingID(this.ship.owner.team) !== undefined ? 1 : 0;

            // Event for every hit tile
            this.eventRegistrar.queueEvent('onHit', {
                builtinAttributes: {
                    patternValue: new AttributeCodeControlled(undefined, true, () => v, () => {}),
                    hitCount: hitCountAttribute,
                    isThis: new AttributeCodeControlled(undefined, true, () => isThis, () => {}),
                    isFriendly: new AttributeCodeControlled(undefined, true, () => isFriendly, () => {}),
                    isVisible: new AttributeCodeControlled(undefined, true, () => isVisible, () => {})
                },
                foreignTeam: ship.owner.team,
                foreignPlayer: ship.owner,
                foreignShip: ship,
                locations: {
                    tile: [[x, y]]
                }
            });
            hitCountContainer.hitCount++;
        }

        // Event for no hits
        if (hitCountContainer.hitCount === 0)
            this.eventRegistrar.queueEvent('onMissCompletely', {
                builtinAttributes: {
                    hitCount: hitCountAttribute
                },
                locations: {}
            });

        // Event for any hit
        else
            this.eventRegistrar.queueEvent('onAnyHit', {
                builtinAttributes: {
                    hitCount: hitCountAttribute
                },
                locations: {}
            });

        this.eventRegistrar.evaluateEvents();
    }

    /**
     * Called when the ship that this ability is attached to rotates
     *
     * @param  rotation Amount the ship was rotated by
     */
    public onShipRotate(rotation: Rotation): void {
        this.selectionPattern = this.selectionPattern.rotated(rotation);
        this.effectPattern = this.effectPattern.rotated(rotation);
    }
}
