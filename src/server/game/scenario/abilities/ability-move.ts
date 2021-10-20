import { getActions } from '../actions/action-getter';
import { getAttributes } from '../attributes/attribute-getter';
import { AttributeMap } from '../attributes/i-attribute-holder';
import { Descriptor } from '../common/descriptor';
import { IPatternSource, Pattern, patternSchema } from '../common/pattern';
import { Condition } from '../conditions/condition';
import { buildCondition } from '../conditions/condition-builder';
import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { Ship } from '../ship';
import { Ability, AbilityActions, abilityEvents, baseAbilitySchema, IBaseAbilitySource } from './ability';
import { EvaluationContext } from '../evaluation-context';

/**
 * AbilityMove - Server Version
 *
 * Ability which moves a ship upon its use
 */
export class AbilityMove extends Ability {

    /**
     * AbilityMove constructor
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
     * Factory function to generate AbilityMove from JSON scenario data
     *
     * @param    parsingContext        Context for resolving scenario data
     * @param    movementAbilitySource JSON data for AbilityMove
     * @param    checkSchema           When true, validates source JSON data against schema
     * @returns                        Created AbilityMove object
     */
    public static async fromSource(parsingContext: ParsingContext, movementAbilitySource: IMovementAbilitySource, checkSchema: boolean): Promise<AbilityMove> {

        // Validate JSON data against schema
        if (checkSchema)
            movementAbilitySource = await checkAgainstSchema(movementAbilitySource, movementAbilitySchema, parsingContext);

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), movementAbilitySource.attributes, 'ability');
        parsingContext = parsingContext.withAbilityAttributes(attributes);

        // Get component elements from source
        const descriptor: Descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), movementAbilitySource.descriptor, false);
        const pattern: Pattern = await Pattern.fromSource(parsingContext.withExtendedPath('.pattern'), movementAbilitySource.pattern, false);
        const condition: Condition = await buildCondition(parsingContext.withExtendedPath('.condition'), movementAbilitySource.condition, false);
        const actions: AbilityActions = await getActions(parsingContext.withExtendedPath('.actions'), abilityEvents, [], movementAbilitySource.actions);

        // Return created AbilityMove object
        return new AbilityMove(parsingContext.shipPartial as Ship, descriptor, pattern, condition, actions, attributes);
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public use(evaluationContext: EvaluationContext): void {

        if (!this.condition.check(evaluationContext))
            return;

        // Check that the movement is allowed
        if (this.pattern.query(evaluationContext.x!, evaluationContext.y!) === 0)
            return;

        this.ship.moveBy(evaluationContext.x!, evaluationContext.y!);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IMovementAbilitySource extends IBaseAbilitySource {
    type: 'move',
    pattern: IPatternSource
}

/**
 * Schema for validating source JSON data
 */
export const movementAbilitySchema = baseAbilitySchema.keys({
    type: 'move',
    pattern: patternSchema.required()
});
