import { checkAgainstSchema }            from '../../schema-checker';
import { buildCondition }                from '../conditions/condition-builder';
import { Action }                        from './action';
import { actionWinSchema }               from './sources/action-win';
import type { GenericEventContext }      from '../../events/event-context';
import type { ParsingContext }           from '../../parsing-context';
import type { TurnManager }              from '../../turn-manager';
import type { Condition }                from '../conditions/condition';
import type { IActionAdvanceTurnSource } from './sources/action-advance-turn';

/**
 * ActionAdvanceTurn - Server Version
 *
 * Action which advances the current turn
 */
export class ActionAdvanceTurn extends Action {

    public constructor(condition: Condition,
                       public readonly turnManager: TurnManager) {
        super(condition);
    }

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
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionAdvanceTurnSource.condition, false);
        parsingContext.reducePath();

        // Return created ActionAdvanceTurn object
        return new ActionAdvanceTurn(condition, parsingContext.turnManagerPartial as TurnManager);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public execute(eventContext: GenericEventContext): void {

        if (!this.condition.check(eventContext))
            return;

        this.turnManager.advanceTurn();
    }
}

