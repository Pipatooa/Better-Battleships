import { checkAgainstSchema }            from '../../schema-checker';
import { buildCondition }                from '../conditions/condition-builder';
import { Action }                        from './action';
import { actionWinSchema }               from './action-win';
import type { EvaluationContext }        from '../../evaluation-context';
import type { ParsingContext }           from '../../parsing-context';
import type { Condition }                from '../conditions/condition';
import type { IActionAdvanceTurnSource } from './sources/action-advance-turn';

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

        evaluationContext.scenario!.turnManager.advanceTurn();
    }
}

