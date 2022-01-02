import { EventRegistrar }                      from '../../events/event-registrar';
import { checkAgainstSchema }                  from '../../schema-checker';
import { eventListenersFromActionSource }      from '../actions/action-getter';
import { getAttributeListeners }               from '../attribute-listeners/attribute-listener-getter';
import { getAttributes }                       from '../attributes/attribute-getter';
import { Descriptor }                          from '../common/descriptor';
import { Pattern }                             from '../common/pattern';
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
import type { Condition }                      from '../conditions/condition';
import type { Ship }                           from '../ship';
import type { AbilityEvent, AbilityEventInfo } from './events/ability-events';
import type { IAbilityMoveSource }             from './sources/ability-move';
import type { IAbilityMoveInfo }               from 'shared/network/scenario/ability-info';

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
                       public readonly pattern: Pattern,
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
        const pattern = await Pattern.fromSource(parsingContext.withExtendedPath('.pattern'), abilityMoveSource.pattern, false);
        parsingContext.reducePath();
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityMoveSource.condition, false);
        parsingContext.reducePath();
        const eventListeners = await eventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), abilityEventInfo, abilityMoveSource.actions);
        parsingContext.reducePath();

        // Return created AbilityMove object
        parsingContext.localAttributes.ability = undefined;
        EventRegistrar.call(eventRegistrarPartial, eventListeners, []);
        AbilityMove.call(abilityPartial, parsingContext.shipPartial as Ship, descriptor, icon, pattern, condition, eventRegistrarPartial, attributes, builtinAttributes, attributeListeners);
        return abilityPartial as AbilityMove;
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  dx Horizontal amount to move
     * @param  dy Vertical amount to move
     */
    public use(dx: number, dy: number): void {
        if (!this.usable)
            return;

        // Check that the movement is allowed
        const patternX = dx + this.pattern.center[0];
        const patternY = dy + this.pattern.center[1];
        if (this.pattern.query(patternX, patternY) === 0)
            return;

        console.log('Start move');

        if (!this.ship.tryMoveBy(dx, dy))
            return;

        console.log('Move finished');

        this.eventRegistrar.queueEvent('onUse', {
            builtinAttributes: {}
        });

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
    public makeTransportable(): IAbilityMoveInfo {
        return {
            type: 'move',
            descriptor: this.descriptor.makeTransportable(),
            icon: this.icon,
            pattern: this.pattern.makeTransportable(false),
            attributes: this.attributeWatcher.exportAttributeInfo(),
            usable: this.usable
        };
    }
}
