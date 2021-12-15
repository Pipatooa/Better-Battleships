import type { GenericEventContext } from '../../events/event-context';

/**
 * Value - Server Version
 *
 * Base class for generic value type
 *
 * When evaluated, values return a number, which can be a dynamic value
 */
export abstract class Value {

    /**
     * Evaluate this dynamic value as a number
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public abstract evaluate(eventContext: GenericEventContext): number;
}
