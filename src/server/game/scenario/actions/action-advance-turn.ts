import { Condition } from '../conditions/condition';
import { buildCondition } from '../conditions/condition-builder';
import { EvaluationContext } from '../evaluation-context';
import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { Action, baseActionSchema, IBaseActionSource } from './action';
import { actionWinSchema } from './action-win';

/**
 * ActionAdvanceTurn - Server Version
 *
 * Action which advances the current turn
 */
export class ActionAdvanceTurn extends Action {

    /**
     * Factory function to generate ActionAdvanceTurn from JSON scenario data
     *
     * @param    parsingContext          Context for resolving scenario data
     * @param    actionAdvanceTurnSource JSON data for ActionAdvanceTurn
     * @param    checkSchema             When true, validates source JSON data against schema
     * @returns                          Created ActionAdvanceTurn object
     */
    public static async fromSource(parsingContext: ParsingContext, actionAdvanceTurnSource: IActionAdvanceTurnSource, checkSchema: boolean): Promise<ActionAdvanceTurn> {

        // Validate JSON data against schema
        if (checkSchema)
            actionAdvanceTurnSource = await checkAgainstSchema(actionAdvanceTurnSource, actionWinSchema, parsingContext);

        // Get condition from source
        const condition: Condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionAdvanceTurnSource.condition, false);

        // Return created ActionAdvanceTurn object
        return new ActionAdvanceTurn(condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public execute(evaluationContext: EvaluationContext): void {

        if (!this.condition.check(evaluationContext))
            return;

        // TODO: Implement turn advancement
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IActionAdvanceTurnSource extends IBaseActionSource {
    type: 'advanceTurn'
}

/**
 * Schema for validating source JSON data
 */
export const actionAdvanceTurnSchema = baseActionSchema.keys({
    type: 'advanceTurn'
});