import { UnpackingError }                         from '../../errors/unpacking-error';
import { checkAgainstSchema }                     from '../../schema-checker';
import { buildCondition }                         from '../conditions/condition-builder';
import { Team }                                   from '../team';
import { Action }                                 from './action';
import { actionDisplayMessageSchema }             from './sources/action-display-message';
import type { IMessageEvent }                     from '../../../../../shared/network/events/i-message';
import type { EventContext, GenericEventContext } from '../../events/event-context';
import type { EventEvaluationState }              from '../../events/event-evaluation-state';
import type { ParsingContext }                    from '../../parsing-context';
import type { Condition }                         from '../conditions/condition';
import type { Player }                            from '../player';
import type { IActionDisplayMessageSource }       from './sources/action-display-message';

/**
 * ActionDisplayMessage - Server Version
 *
 * Action which causes the current player to lose the game
 */
export class ActionDisplayMessage extends Action {

    /**
     * ActionDisplayMessage constructor
     *
     * @param  display   Where to display the message
     * @param  target    Target to display message to
     * @param  message   Message to display
     * @param  priority  Priority to use for event listener created for this action
     * @param  condition Condition that must hold true for this action to execute.
     */
    private constructor(private readonly display: 'message' | 'popup',
                        private readonly target: Team | Player | 'team' | 'player',
                        private readonly message: string,
                        priority: number,
                        condition: Condition) {
        super(priority, condition);
    }

    /**
     * Factory function to generate ActionDisplayMessage from JSON scenario data
     *
     * @param    parsingContext             Context for resolving scenario data
     * @param    actionDisplayMessageSource JSON data for ActionDisplayMessage
     * @param    checkSchema                When true, validates source JSON data against schema
     * @returns                             Created ActionDisplayMessage object
     */
    public static async fromSource(parsingContext: ParsingContext, actionDisplayMessageSource: IActionDisplayMessageSource, checkSchema: boolean): Promise<ActionDisplayMessage> {

        // Validate JSON data against schema
        if (checkSchema)
            actionDisplayMessageSource = await checkAgainstSchema(actionDisplayMessageSource, actionDisplayMessageSchema, parsingContext);

        // Get condition from source
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionDisplayMessageSource.condition, false);
        parsingContext.reducePath();

        // Find target
        let target: Team | Player | 'team' | 'player';
        switch (actionDisplayMessageSource.target) {
            case 'local:team':
                if (parsingContext.teamPartial === undefined)
                    throw new UnpackingError(`The 'displayMessage' action defined at '${parsingContext.currentPath}' is invalid. No team to refer to.`,
                        parsingContext);
                target = parsingContext.teamPartial as Team;
                break;
            case 'local:player':
                if (parsingContext.playerPartial === undefined)
                    throw new UnpackingError(`The 'displayMessage' action defined at '${parsingContext.currentPath}' is invalid. No player to refer to.`,
                        parsingContext);
                target = parsingContext.playerPartial as Player;
                break;
            case 'foreign:team':
                if (parsingContext.currentEventInfo === undefined || !parsingContext.currentEventInfo[0].includes('team'))
                    throw new UnpackingError(`The 'displayMessage' action defined at '${parsingContext.currentPath}' is invalid. No foreign team to refer to.`,
                        parsingContext);
                target = 'team';
                break;
            case 'foreign:player':
                if (parsingContext.currentEventInfo === undefined || !parsingContext.currentEventInfo[0].includes('team'))
                    throw new UnpackingError(`The 'displayMessage' action defined at '${parsingContext.currentPath}' is invalid. No foreign player to refer to.`,
                        parsingContext);
                target = 'player';
                break;
        }

        // Return created ActionDisplayMessage object
        return new ActionDisplayMessage(actionDisplayMessageSource.display, target, actionDisplayMessageSource.message, actionDisplayMessageSource.priority ?? 0, condition);
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

        // Select target dynamically if necessary
        const target = this.target === 'team'
            ? (eventContext as EventContext<'team', any, any, any>).foreignTeam
            : this.target === 'player'
                ? (eventContext as EventContext<'player', any, any, any>).foreignPlayer
                : this.target;

        // Send message event to clients
        const event: IMessageEvent = {
            event: 'message',
            display: this.display,
            message: this.message
        };
        if (target instanceof Team)
            target.broadcastEvent(event);
        else
            target.client!.sendEvent(event);
    }
}
