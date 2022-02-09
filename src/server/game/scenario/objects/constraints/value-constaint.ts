import type { GenericEventContext } from '../../events/event-context';

/**
 * ValueConstraint - Server Version
 *
 * Base class for value constrains which allow a value to be checked against themselves,
 * or for a value to be changed to meet the constrain
 */
export abstract class ValueConstraint {

    /**
     * Checks whether a value meets this constraint
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @param    value        Value to check
     * @returns               Whether value met this constraint
     */
    public abstract check(eventContext: GenericEventContext, value: number): boolean;

    /**
     * Changes a value to meet this constraint
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @param    value        Value to constrain
     * @returns               New value that meets this constraint
     */
    public abstract constrain(eventContext: GenericEventContext, value: number): number;
}
