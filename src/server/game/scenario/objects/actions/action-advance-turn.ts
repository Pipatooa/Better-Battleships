import { UnpackingError }                from '../../errors/unpacking-error';
import { checkAgainstSchema }            from '../../schema-checker';
import { buildCondition }                from '../conditions/condition-builder';
import { Action }                        from './action';
import { actionWinSchema }               from './sources/action-win';
import type { GenericEventContext }      from '../../events/event-context';
import type { EventEvaluationState }     from '../../events/event-evaluation-state';
import type { ParsingContext }           from '../../parsing-context';
import type { TurnManager }              from '../../turn-manager';
import type { Condition }                from '../conditions/condition';
import type { Player }                   from '../player';
import type { IActionAdvanceTurnSource } from './sources/action-advance-turn';

/**
 * ActionAdvanceTurn - Server Version
 *
 * Action which advances the current turn
 */
export class ActionAdvanceTurn extends Action {

    /**
     * ActionAdvanceTurn constructor
     *
     * @param  player      Player to advance turn for
     * @param  priority    Priority to use for event listener created for this action
     * @param  condition   Condition which must hold true for this action to execute
     * @param  turnManager Turn manager to advance turn
     */
    public constructor(private readonly player: Player,
                       priority: number,
                       condition: Condition,
                       private readonly turnManager: TurnManager) {
        super(priority, condition);
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

        // Check that player exists to advance turn for
        if (parsingContext.playerPartial === undefined)
            throw new UnpackingError(`The 'advanceTurn' action defined at '${parsingContext.currentPath}' is invalid. No player to advance turn for.`,
                parsingContext);

        // Get condition from source
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionAdvanceTurnSource.condition, false);
        parsingContext.reducePath();

        // Return created ActionAdvanceTurn object
        return new ActionAdvanceTurn(parsingContext.playerPartial as Player, actionAdvanceTurnSource.priority ?? 0, condition, parsingContext.turnManagerPartial as TurnManager);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     */
    public execute(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext): void {
        super.execute(eventEvaluationState, eventContext);
        if (!this.condition.check(eventContext))
            return;
        if (this.turnManager.currentTurn !== this.player)
            return;
        this.turnManager.advanceTurn(true);
    }
}
