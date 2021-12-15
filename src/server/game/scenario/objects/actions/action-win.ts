import { checkAgainstSchema }    from '../../schema-checker';
import { buildCondition }        from '../conditions/condition-builder';
import { Action }                from './action';
import { actionWinSchema }                        from './sources/action-win';
import type { EventContext, GenericEventContext } from '../../events/event-context';
import type { ParsingContext }                    from '../../parsing-context';
import type { IActionWinSource } from './sources/action-win';

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
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionWinSource.condition, false);
        parsingContext.reducePath();

        // Return created ActionWin object
        return new ActionWin(condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public execute(eventContext: GenericEventContext): void {

        if (!this.condition.check(eventContext))
            return;

        // TODO: Implement winning
    }
}
