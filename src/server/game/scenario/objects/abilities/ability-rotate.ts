import { Rotation }                  from '../../../../../shared/scenario/objects/common/rotation';
import { checkAgainstSchema }        from '../../schema-checker';
import { getActions }                from '../actions/action-getter';
import { getAttributes }             from '../attributes/attribute-getter';
import { Descriptor }                from '../common/descriptor';
import { buildCondition }            from '../conditions/condition-builder';
import { IndexedAbility }            from './ability';
import { baseAbilityEvents }         from './events/base-ability-events';
import { abilityRotateSchema }       from './sources/ability-rotate';
import type { EvaluationContext }    from '../../evaluation-context';
import type { ParsingContext }       from '../../parsing-context';
import type { AttributeMap }         from '../attributes/i-attribute-holder';
import type { Condition }            from '../conditions/condition';
import type { Ship }                 from '../ship';
import type { AbilityActions }       from './events/base-ability-events';
import type { IAbilityRotateSource } from './sources/ability-rotate';
import type { AbilityInfo }          from 'shared/network/scenario/ability-info';

/**
 * AbilityFire - Server Version
 *
 * Ability which rotates a ship upon its use
 */
export class AbilityRotate extends IndexedAbility {

    /**
     * AbilityFire constructor
     *
     * @param  ship          Parent ship which this ability belongs to
     * @param  descriptor    Descriptor for ability
     * @param  rot90allowed  Whether or not a rotation by 90 degrees is allowed
     * @param  rot180allowed Whether or not a rotation by 180 degrees is allowed
     * @param  rot270allowed Whether or not a rotation by 270 degrees is allowed
     * @param  condition     Condition which must hold true to be able to use this action
     * @param  actions       Actions to execute when events are triggered
     * @param  attributes    Attributes for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       public readonly rot90allowed: boolean,
                       public readonly rot180allowed: boolean,
                       public readonly rot270allowed: boolean,
                       condition: Condition,
                       actions: AbilityActions,
                       attributes: AttributeMap) {
        super(ship, descriptor, condition, actions, attributes);
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

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), abilityRotateSource.attributes, 'ability');
        parsingContext = parsingContext.withAbilityAttributes(attributes);

        // Get component elements from source
        const descriptor: Descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), abilityRotateSource.descriptor, false);
        const condition: Condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityRotateSource.condition, false);
        const actions: AbilityActions = await getActions(parsingContext.withExtendedPath('.actions'), baseAbilityEvents, [], abilityRotateSource.actions);

        // Return created AbilityFire object
        return new AbilityRotate(parsingContext.shipPartial as Ship, descriptor, abilityRotateSource.rot90, abilityRotateSource.rot180, abilityRotateSource.rot270, condition, actions, attributes);
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public use(evaluationContext: EvaluationContext): void {

        if (!this.usable!)
            return;

        if (evaluationContext.index === 0 && this.rot90allowed) this.ship.rotate(Rotation.Clockwise90);
        else if (evaluationContext.index === 1 && this.rot180allowed) this.ship.rotate(Rotation.Clockwise180);
        else if (evaluationContext.index === 2 && this.rot270allowed) this.ship.rotate(Rotation.Clockwise270);
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
            type: 'rotate',
            descriptor: this.descriptor.makeTransportable(),
            rot90: this.rot90allowed,
            rot180: this.rot180allowed,
            rot270: this.rot270allowed
        };
    }
}
