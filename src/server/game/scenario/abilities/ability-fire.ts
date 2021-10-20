import Joi from 'joi';
import { Action, actionSchema, IActionSource } from '../actions/action';
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
import { Ability, abilityEvents, baseAbilitySchema, IBaseAbilitySource } from './ability';
import { EvaluationContext } from '../evaluation-context';

/**
 * AbilityFire - Server Version
 *
 * Ability which acts upon a selected group of cells upon its use
 */
export class AbilityFire extends Ability {

    /**
     * AbilityFire constructor
     *
     * @param  ship             Parent ship which this ability belongs to
     * @param  descriptor       Descriptor for ability
     * @param  selectionPattern Pattern determining which cell can be selected to apply the affect pattern around
     * @param  effectPattern    Pattern determining which cells around the selected cell are affected
     * @param  condition        Condition which must hold true to be able to use this action
     * @param  actions          Actions to execute when events are triggered
     * @param  attributes       Attributes for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       public readonly selectionPattern: Pattern,
                       public readonly effectPattern: Pattern,
                       condition: Condition,
                       actions: FireAbilityActions,
                       attributes: AttributeMap) {
        super(ship, descriptor, condition, actions, attributes);
    }


    /**
     * Factory function to generate AbilityFire from JSON scenario data
     *
     * @param    parsingContext    Context for resolving scenario data
     * @param    fireAbilitySource JSON data for AbilityFire
     * @param    checkSchema       When true, validates source JSON data against schema
     * @returns                    Created AbilityFire object
     */
    public static async fromSource(parsingContext: ParsingContext, fireAbilitySource: IFireAbilitySource, checkSchema: boolean): Promise<AbilityFire> {

        // Validate JSON data against schema
        if (checkSchema)
            fireAbilitySource = await checkAgainstSchema(fireAbilitySource, fireAbilitySchema, parsingContext);

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), fireAbilitySource.attributes, 'ability');
        parsingContext = parsingContext.withAbilityAttributes(attributes);

        // Get component elements from source
        const descriptor: Descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), fireAbilitySource.descriptor, false);
        const selectionPattern: Pattern = await Pattern.fromSource(parsingContext.withExtendedPath('.selectionPattern'), fireAbilitySource.selectionPattern, false);
        const effectPattern: Pattern = await Pattern.fromSource(parsingContext.withExtendedPath('.effectPattern'), fireAbilitySource.effectPattern, false);
        const condition: Condition = await buildCondition(parsingContext.withExtendedPath('.condition'), fireAbilitySource.condition, false);
        const actions: FireAbilityActions = await getActions(parsingContext.withExtendedPath('.actions'), fireAbilityEvents, ['onHit'], fireAbilitySource.actions);

        // Return created AbilityFire object
        return new AbilityFire(parsingContext.shipPartial as Ship, descriptor, selectionPattern, effectPattern, condition, actions, attributes);
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
        if (this.selectionPattern.query(evaluationContext.x!, evaluationContext.y!) === 0)
            return;

        this.ship.moveBy(evaluationContext.x!, evaluationContext.y!);
    }
}

/**
 * List of event names for fire ability
 */
export const fireAbilityEvents = [
    ...abilityEvents,
    'onHit'
] as const;

/**
 * Type matching all fire ability event name strings
 */
export type FireAbilityEvent = typeof fireAbilityEvents[number];

/**
 * Type describing a dictionary of actions tied to ability event names
 */
export type FireAbilityActions = { [event in FireAbilityEvent]: Action[] };

/**
 * JSON source interface reflecting schema
 */
export interface IFireAbilitySource extends IBaseAbilitySource {
    type: 'fire',
    selectionPattern: IPatternSource,
    effectPattern: IPatternSource,
    actions: { [event in FireAbilityEvent]: IActionSource[] }
}

/**
 * Schema for validating source JSON data
 */
export const fireAbilitySchema = baseAbilitySchema.keys({
    type: 'fire',
    selectionPattern: patternSchema.required(),
    effectPattern: patternSchema.required(),
    actions: Joi.object().pattern(Joi.valid(...fireAbilityEvents), Joi.array().items(actionSchema)).required()
});
