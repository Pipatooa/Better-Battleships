import { checkAgainstSchema }     from '../../schema-checker';
import { buildCondition }         from '../conditions/condition-builder';
import { Action }                 from './action';
import { baseActionSchema }       from './sources/base-action';
import type { EvaluationContext } from '../../evaluation-context';
import type { ParsingContext }    from '../../parsing-context';
import type { Condition }         from '../conditions/condition';
import type { IBaseActionSource } from './sources/base-action';

/**
 * ActionWin - Server Version
 *
 * Action which causes the current team to win the game
 */
export class ActionWin extends Action {

    /**
     * Factory function to generate ActionWin from JSON scenario data
     *
     * @param    parsingContext  Context for resolving scenario data
     * @param    actionWinSource JSON data for ActionWin
     * @param    checkSchema     When true, validates source JSON data against schema
     * @returns                  Created ActionWin object
     */
    public static async fromSource(parsingContext: ParsingContext, actionWinSource: IActionWinSource, checkSchema: boolean): Promise<ActionWin> {

        // Validate JSON data against schema
        if (checkSchema)
            actionWinSource = await checkAgainstSchema(actionWinSource, actionWinSchema, parsingContext);

        // Get condition from source
        const condition: Condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionWinSource.condition, false);
        parsingContext.reducePath();

        // Return created ActionWin object
        return new ActionWin(condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public execute(evaluationContext: EvaluationContext): void {

        if (!this.condition.check(evaluationContext))
            return;

        // TODO: Implement winning
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IActionWinSource extends IBaseActionSource {
    type: 'win'
}

/**
 * Schema for validating source JSON data
 */
export const actionWinSchema = baseActionSchema.keys({
    type: 'win'
});
