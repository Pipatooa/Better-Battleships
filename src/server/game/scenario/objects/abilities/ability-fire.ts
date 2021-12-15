import { EventRegistrar }                              from '../../events/event-registrar';
import { checkAgainstSchema }                          from '../../schema-checker';
import { eventListenersFromActionSource }              from '../actions/action-getter';
import { getAttributes }                               from '../attributes/attribute-getter';
import { AttributeSpecial }                            from '../attributes/attribute-special';
import { Descriptor }                                  from '../common/descriptor';
import { Pattern }                                     from '../common/pattern';
import { buildCondition }                              from '../conditions/condition-builder';
import { Ability }                                     from './ability';
import { fireAbilityEventInfo }                        from './events/fire-ability-event';
import { PositionedAbility }                           from './positioned-ability';
import { abilityFireSchema }                           from './sources/ability-fire';
import type { ParsingContext }                         from '../../parsing-context';
import type { SpecialAttributeRecord }                 from '../attributes/attribute-holder';
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
     * @param  selectionPattern           Pattern determining which cell can be selected to apply the affect pattern around
     * @param  effectPattern              Pattern determining which cells around the selected cell are affected
     * @param  displayEffectPatternValues Whether or not effect pattern values should be displayed to the client when using the ability
     * @param  condition                  Condition which must hold true to be able to use this action
     * @param  eventRegistrar             Registrar of all ability event listeners
     * @param  attributes                 Attributes for the ability
     * @param  specialAttributes          Special attributes for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       public readonly selectionPattern: Pattern,
                       public readonly effectPattern: Pattern,
                       public readonly displayEffectPatternValues: boolean,
                       condition: Condition,
                       eventRegistrar: EventRegistrar<FireAbilityEventInfo, FireAbilityEvent>,
                       attributes: AttributeMap,
                       specialAttributes: SpecialAttributeRecord<'ability'>) {

        super(ship, descriptor, condition, eventRegistrar, attributes, specialAttributes);
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

        // Ability partial refers to future Ability object
        const abilityPartial: Partial<Ability> = {};

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), abilityFireSource.attributes, 'ability');
        const specialAttributes = Ability.generateSpecialAttributes(abilityPartial as Ability);
        parsingContext.localAttributes.ability = [attributes, specialAttributes];
        parsingContext.reducePath();

        // Get component elements from source
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), abilityFireSource.descriptor, false);
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
        const eventRegistrar = new EventRegistrar(eventListeners, []);
        AbilityFire.call(abilityPartial, parsingContext.shipPartial as Ship, descriptor, selectionPattern, effectPattern, abilityFireSource.displayEffectPatternValues, condition, eventRegistrar, attributes, specialAttributes);
        (abilityPartial as any).__proto__ = AbilityFire.prototype;
        return abilityPartial as AbilityFire;
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  x X coordinate of effect pattern
     * @param  y Y coordinate of effect pattern
     */
    public use(x: number, y: number): void {

        if (!this.usable!)
            return;

        const selectionPatternX = x - this.selectionPattern.center[0];
        const selectionPatternY = y - this.selectionPattern.center[1];

        if (this.selectionPattern.query(selectionPatternX, selectionPatternY) === 0)
            return;

        this.eventRegistrar.triggerEvent('onUse', {
            specialAttributes: {}
        });

        let hit = false;
        for (const [dx, dy, v] of this.effectPattern.patternEntries) {
            const tile = this.ship.board.tiles[y + dy]?.[x + dx];
            const ship = tile?.[2];
            if (ship !== undefined) {
                this.eventRegistrar.triggerEvent('onHit', {
                    specialAttributes: {
                        patternValue: new AttributeSpecial(() => v)
                    },
                    foreignTeam: ship.owner.team,
                    foreignPlayer: ship.owner,
                    foreignShip: ship
                });
                hit = true;
            }
        }

        if (!hit) {
            this.eventRegistrar.triggerEvent('onMiss', {
                specialAttributes: {}
            });
        }

        this.eventRegistrar.triggerEvent('onAbilityUsed', {
            specialAttributes: {},
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
    public makeTransportable(): AbilityInfo {
        return {
            type: 'fire',
            descriptor: this.descriptor.makeTransportable(),
            selectionPattern: this.selectionPattern.makeTransportable(false),
            effectPattern: this.effectPattern.makeTransportable(this.displayEffectPatternValues)
        };
    }
}
