import { UnpackingError }                         from '../../errors/unpacking-error';
import { checkAgainstSchema }                     from '../../schema-checker';
import { buildCondition }                         from '../conditions/condition-builder';
import { Action }                                 from './action';
import { actionLoseSchema }                       from './sources/action-lose';
import type { EventContext, GenericEventContext } from '../../events/event-context';
import type { EventEvaluationState }              from '../../events/event-evaluation-state';
import type { ParsingContext }                    from '../../parsing-context';
import type { Condition }                         from '../conditions/condition';
import type { Player }                            from '../player';
import type { IActionLoseSource }                 from './sources/action-lose';

/**
 * ActionLose - Server Version
 *
 * Action which causes the current player to lose the game
 */
export class ActionLose extends Action {

    /**
     * ActionLose constructor
     *
     * @param  player    Player to cause to lose. If undefined, will use player found in event context
     * @param  priority  Priority to use for event listener created for this action
     * @param  condition Condition that must hold true for this action to execute.
     */
    private constructor(private readonly player: Player | undefined,
                        priority: number,
                        condition: Condition) {
        super(priority, condition);
    }
    
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

        let player: Player | undefined;
        switch (actionLoseSource.player) {
            case 'local':
                if (parsingContext.playerPartial === undefined)
                    throw new UnpackingError(`The 'lose' action defined at '${parsingContext.currentPath}' is invalid. No player to refer to.`,
                        parsingContext);
                player = parsingContext.playerPartial as Player;
                break;
            case 'foreign':
                if (parsingContext.currentEventInfo === undefined || !parsingContext.currentEventInfo[0].includes('player'))
                    throw new UnpackingError(`The 'lose' action defined at '${parsingContext.currentPath}' is invalid. No foreign player to refer to.`,
                        parsingContext);

                player = undefined;
                break;
        }
        
        // Return created ActionLose object
        return new ActionLose(player, actionLoseSource.priority ?? 0, condition);
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

        const player = this.player ?? (eventContext as EventContext<'player', any, any, any>).foreignPlayer;
        player.lose( true);
    }
}
