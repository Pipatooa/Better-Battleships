import type { GenericEventContext }  from '../../events/event-context';
import type { EventEvaluationState } from '../../events/event-evaluation-state';
import type { Condition }            from '../conditions/condition';

/**
 * Action - Server Version
 *
 * Base class for actions which perform game logic when executed
 */
export abstract class Action {

    /**
     * Action constructor
     *
     * @param  priority  Priority to use for event listener created for this action
     * @param  condition Condition that must hold true for this action to execute
     */
    protected constructor(public readonly priority: number,
                          protected readonly condition: Condition) {
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     */
    public execute(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext): void {
        eventEvaluationState.bumpActionCount();
    }
}
