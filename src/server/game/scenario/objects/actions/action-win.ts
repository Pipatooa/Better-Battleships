import { UnpackingError }                              from '../../errors/unpacking-error';
import { checkAgainstSchema }                          from '../../schema-checker';
import { buildCondition }                              from '../conditions/condition-builder';
import { Action }                                      from './action';
import { actionWinSchema }                             from './sources/action-win';
import type { ECA, EventContext, GenericEventContext } from '../../events/event-context';
import type { EventEvaluationState }                   from '../../events/event-evaluation-state';
import type { ParsingContext }                         from '../../parsing-context';
import type { Condition }                              from '../conditions/condition';
import type { Team }                                   from '../team';
import type { IActionWinSource }                       from './sources/action-win';

/**
 * ActionWin - Server Version
 *
 * Action which causes the current team to win the game
 */
export class ActionWin extends Action {

    /**
     * ActionWin constructor
     *
     * @param  team      Team to trigger win for. If undefined, will use team found in event context
     * @param  priority  Priority to use for event listener created for this action
     * @param  condition Condition that must hold true for this action to execute.
     */
    private constructor(private readonly team: Team | undefined,
                        priority: number,
                        condition: Condition) {
        super(priority, condition);
    }

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

        let team: Team | undefined;
        switch (actionWinSource.team) {
            case 'local':
                if (parsingContext.teamPartial === undefined)
                    throw new UnpackingError(`The 'win' action defined at '${parsingContext.currentPath}' is invalid. No team to refer to.`,
                        parsingContext);
                team = parsingContext.teamPartial as Team;
                break;
            case 'foreign':
                if (parsingContext.currentEventInfo === undefined || !parsingContext.currentEventInfo[0].includes('team'))
                    throw new UnpackingError(`The 'win' action defined at '${parsingContext.currentPath}' is invalid. No foreign team to refer to.`,
                        parsingContext);

                team = undefined;
                break;
        }

        // Return created ActionWin object
        return new ActionWin(team, actionWinSource.priority ?? 0, condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     * Current state of the evaluation
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     */
    public execute(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext): void {
        super.execute(eventEvaluationState, eventContext);
        if (!this.condition.check(eventContext))
            return;

        const team = this.team ?? (eventContext as EventContext<'team', ECA>).foreignTeam;
        for (const otherTeam of Object.values(team.scenario.teams)) {
            if (otherTeam === team)
                continue;
            otherTeam.lose(true);
        }
    }
}
