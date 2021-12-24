import { checkAgainstSchema }       from '../../schema-checker';
import { buildCondition }           from '../conditions/condition-builder';
import { Action }                   from './action';
import { actionLoseSchema }         from './sources/action-lose';
import type { GenericEventContext } from '../../events/event-context';
import type { ParsingContext }      from '../../parsing-context';
import type { IActionLoseSource }   from './sources/action-lose';

/**
 * ActionLose - Server Version
 *
 * Action which causes the current team to lose the game
 */
export class ActionLose extends Action {

    /**
     * Factory function to generate ActionLose from JSON scenario data
     *
     * @param    parsingContext   Context for resolving scenario data
     * @param    actionLoseSource JSON data for ActionLose
     * @param    checkSchema      When true, validates source JSON data against schema
     * @returns                   Created ActionLose object
     */
    public static async fromSource(parsingContext: ParsingContext, actionLoseSource: IActionLoseSource, checkSchema: boolean): Promise<ActionLose> {

        // Validate JSON data against schema
        if (checkSchema)
            actionLoseSource = await checkAgainstSchema(actionLoseSource, actionLoseSchema, parsingContext);

        // Get condition from source
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionLoseSource.condition, false);
        parsingContext.reducePath();

        // Return created ActionLose object
        return new ActionLose(condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public execute(eventContext: GenericEventContext): void {

        if (!this.condition.check(eventContext))
            return;

        // TODO: Implement losing
    }
}
