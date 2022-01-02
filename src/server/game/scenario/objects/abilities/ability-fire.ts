import { EventRegistrar }                              from '../../events/event-registrar';
import { checkAgainstSchema }                          from '../../schema-checker';
import { eventListenersFromActionSource }              from '../actions/action-getter';
import { getAttributeListeners }                       from '../attribute-listeners/attribute-listener-getter';
import { AttributeCodeControlled }                     from '../attributes/attribute-code-controlled';
import { getAttributes }                               from '../attributes/attribute-getter';
import { Descriptor }                                  from '../common/descriptor';
import { Pattern }                                     from '../common/pattern';
import { buildCondition }                              from '../conditions/condition-builder';
import { Ability }                                     from './ability';
import { fireAbilityEventInfo }                        from './events/fire-ability-event';
import { getIconUrlFromSource }                        from './icons';
import { PositionedAbility }                           from './positioned-ability';
import { abilityFireSchema }                           from './sources/ability-fire';
import type { ParsingContext }                         from '../../parsing-context';
import type { AttributeListener }                      from '../attribute-listeners/attribute-listener';
import type { BuiltinAttributeRecord }                 from '../attributes/attribute-holder';
import type { AttributeMap }                           from '../attributes/i-attribute-holder';
import type { Condition }                              from '../conditions/condition';
import type { Ship }                                   from '../ship';
import type { FireAbilityEvent, FireAbilityEventInfo } from './events/fire-ability-event';
import type { IAbilityFireSource }                     from './sources/ability-fire';
import type { AbilityInfo }                            from 'shared/network/scenario/ability-info';

/**
 * AbilityFire - Server Version
 *
 * Ability which acts upon a selected group of cells upon its use
 */
export class AbilityFire extends PositionedAbility {

    public readonly eventRegistrar: EventRegistrar<FireAbilityEventInfo, FireAbilityEvent>;

    /**
     * AbilityFire constructor
     *
     * @param  ship                       Parent ship which this ability belongs to
     * @param  descriptor                 Descriptor for ability
     * @param  icon                       Url to icon for this ability
     * @param  selectionPattern           Pattern determining which cell can be selected to apply the affect pattern around
     * @param  effectPattern              Pattern determining which cells around the selected cell are affected
     * @param  displayEffectPatternValues Whether effect pattern values should be displayed to the client when using the ability
     * @param  condition                  Condition which must hold true to be able to use this action
     * @param  eventRegistrar             Registrar of all ability event listeners
     * @param  attributes                 Attributes for the ability
     * @param  builtinAttributes          Built-in attributes for the ability
     * @param  attributeListeners         Attribute listeners for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       icon: string,
                       public readonly selectionPattern: Pattern,
                       public readonly effectPattern: Pattern,
                       public readonly displayEffectPatternValues: boolean,
                       condition: Condition,
                       eventRegistrar: EventRegistrar<FireAbilityEventInfo, FireAbilityEvent>,
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
        const eventRegistrarPartial = Object.create(EventRegistrar.prototype) as EventRegistrar<FireAbilityEventInfo, FireAbilityEvent>;

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
        const selectionPattern = await Pattern.fromSource(parsingContext.withExtendedPath('.selectionPattern'), abilityFireSource.selectionPattern, false);
        parsingContext.reducePath();
        const effectPattern = await Pattern.fromSource(parsingContext.withExtendedPath('.effectPattern'), abilityFireSource.effectPattern, false);
        parsingContext.reducePath();
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityFireSource.condition, false);
        parsingContext.reducePath();
        const eventListeners = await eventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), fireAbilityEventInfo, abilityFireSource.actions);
        parsingContext.reducePath();

        // Return created AbilityFire object
        parsingContext.localAttributes.ability = undefined;
        EventRegistrar.call(eventRegistrarPartial, eventListeners, []);
        AbilityFire.call(abilityPartial, parsingContext.shipPartial as Ship, descriptor, icon, selectionPattern, effectPattern, abilityFireSource.displayEffectPatternValues, condition, eventRegistrarPartial, attributes, builtinAttributes, attributeListeners);
        return abilityPartial as AbilityFire;
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  x X coordinate of effect pattern
     * @param  y Y coordinate of effect pattern
     */
    public use(x: number, y: number): void {
        if (!this.usable)
            return;

        const selectionPatternX = x - this.selectionPattern.center[0];
        const selectionPatternY = y - this.selectionPattern.center[1];

        if (this.selectionPattern.query(selectionPatternX, selectionPatternY) === 0)
            return;

        this.eventRegistrar.queueEvent('onUse', {
            builtinAttributes: {}
        });

        const hitCountContainer = {
            hitCount: 0
        };

        for (const [dx, dy, v] of this.effectPattern.patternEntries) {
            const tile = this.ship.board.tiles[y + dy]?.[x + dx];
            const ship = tile?.[2];
            if (ship !== undefined) {
                this.eventRegistrar.queueEvent('onHit', {
                    builtinAttributes: {
                        patternValue: new AttributeCodeControlled(() => v, () => {}, true),
                        hitCount: new AttributeCodeControlled(() => hitCountContainer.hitCount, () => {}, true)
                    },
                    foreignTeam: ship.owner.team,
                    foreignPlayer: ship.owner,
                    foreignShip: ship
                });
                hitCountContainer.hitCount++;
            }
        }

        if (hitCountContainer.hitCount === 0) {
            this.eventRegistrar.queueEvent('onMiss', {
                builtinAttributes: {}
            });
        }

        this.eventRegistrar.rootRegistrar.queueEvent('onAbilityUsed', {
            builtinAttributes: {},
            foreignTeam: this.ship.owner.team,
            foreignPlayer: this.ship.owner,
            foreignShip: this.ship,
            foreignAbility: this
        });

        this.eventRegistrar.evaluateEvents();
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created AbilityInfo object
     */
    public makeTransportable(): AbilityInfo {
        return {
            type: 'fire',
            descriptor: this.descriptor.makeTransportable(),
            icon: this.icon,
            selectionPattern: this.selectionPattern.makeTransportable(false),
            effectPattern: this.effectPattern.makeTransportable(this.displayEffectPatternValues),
            attributes: this.attributeWatcher.exportAttributeInfo(),
            usable: this.usable
        };
    }
}
