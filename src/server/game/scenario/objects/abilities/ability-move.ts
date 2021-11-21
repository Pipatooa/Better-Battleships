import { checkAgainstSchema }      from '../../schema-checker';
import { getActions }              from '../actions/action-getter';
import { getAttributes }           from '../attributes/attribute-getter';
import { Descriptor }              from '../common/descriptor';
import { Pattern }                 from '../common/pattern';
import { buildCondition }          from '../conditions/condition-builder';
import { PositionedAbility }       from './ability';
import { baseAbilityEvents }       from './events/base-ability-events';
import { abilityMoveSchema }       from './sources/ability-move';
import type { EvaluationContext }  from '../../evaluation-context';
import type { ParsingContext }     from '../../parsing-context';
import type { AttributeMap }       from '../attributes/i-attribute-holder';
import type { Condition }          from '../conditions/condition';
import type { Ship }               from '../ship';
import type { AbilityActions }     from './events/base-ability-events';
import type { IAbilityMoveSource } from './sources/ability-move';
import type { AbilityInfo }        from 'shared/network/scenario/ability-info';

/**
 * AbilityFire - Server Version
 *
 * Ability which moves a ship upon its use
 */
export class AbilityMove extends PositionedAbility {

    /**
     * AbilityFire constructor
     *
     * @param  ship       Parent ship which this ability belongs to
     * @param  descriptor Descriptor for ability
     * @param  pattern    Pattern describing possible movements
     * @param  condition  Condition which must hold true to be able to use this action
     * @param  actions    Actions to execute when events are triggered
     * @param  attributes Attributes for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       public readonly pattern: Pattern,
                       condition: Condition,
                       actions: AbilityActions,
                       attributes: AttributeMap) {
        super(ship, descriptor, condition, actions, attributes);
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

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), abilityMoveSource.attributes, 'ability');
        parsingContext = parsingContext.withAbilityAttributes(attributes);

        // Get component elements from source
        const descriptor: Descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), abilityMoveSource.descriptor, false);
        const pattern: Pattern = await Pattern.fromSource(parsingContext.withExtendedPath('.pattern'), abilityMoveSource.pattern, false);
        const condition: Condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityMoveSource.condition, false);
        const actions: AbilityActions = await getActions(parsingContext.withExtendedPath('.actions'), baseAbilityEvents, [], abilityMoveSource.actions);

        // Return created AbilityFire object
        return new AbilityMove(parsingContext.shipPartial as Ship, descriptor, pattern, condition, actions, attributes);
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public use(evaluationContext: EvaluationContext): void {

        if (!this.usable!)
            return;

        // Check that the movement is allowed
        if (this.pattern.query(evaluationContext.x!, evaluationContext.y!) === 0)
            return;

        this.ship.moveBy(evaluationContext.x!, evaluationContext.y!);
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
            type: 'move',
            descriptor: this.descriptor.makeTransportable(),
            pattern: this.pattern.makeTransportable(false)
        };
    }
}
