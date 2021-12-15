import type { GenericEventContext } from '../../events/event-context';
import type { Condition }           from '../conditions/condition';

/**
 * Action - Server Version
 *
 * Base class for actions which perform game logic when executed
 */
export abstract class Action {

    /**
     * Action constructor
     *
     * @param  condition Condition that must hold true for this action to execute
     */
    protected constructor(public readonly condition: Condition) {
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public abstract execute(eventContext: GenericEventContext): void;
}
