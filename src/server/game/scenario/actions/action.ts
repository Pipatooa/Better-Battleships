import Joi from 'joi';
import { attributeReferenceSchema } from '../attributes/references/attribute-reference';
import { Condition, conditionSchema, IConditionSource } from '../conditions/condition';
import { EvaluationContext } from '../evaluation-context';
import { valueSchema } from '../values/value';
import { IActionAdvanceTurnSource } from './action-advance-turn';
import { IActionSetAttributeSource } from './action-set-attribute';
import { IActionWinSource } from './action-win';

/**
 * Action - Server Version
 *
 * Base class for actions which perform game logic when executed
 */
export abstract class Action {

    /**
     * Action constructor
     *
     * @param  condition Condition that must hold true for this action to execute
     */
    protected constructor(public readonly condition: Condition) {
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public abstract execute(evaluationContext: EvaluationContext): void;
}

/**
 * JSON source interface reflecting base action schema
 */
export interface IBaseActionSource {
    type: string,
    condition: IConditionSource | Record<string, never>;
}

/**
 * JSON source interface reflecting full action schema
 */
export type IActionSource =
    IActionSetAttributeSource |
    IActionAdvanceTurnSource |
    IActionWinSource;

/**
 * Base schema for validating source JSON data
 */
export const baseActionSchema = Joi.object({
    type: Joi.string().required(),
    condition: Joi.alternatives(
        Joi.object().required(),
        conditionSchema.required()
    ).required()
});

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all actions
 */
export const actionSchema = baseActionSchema.keys({
    type: Joi.valid('setAttribute', 'advanceTurn', 'win'),
    attribute: attributeReferenceSchema.when('type',
        { is: 'setAttribute', then: Joi.required(), otherwise: Joi.forbidden() }),
    value: valueSchema.when('type',
        { is: 'setAttribute', then: Joi.required(), otherwise: Joi.forbidden() })
});
