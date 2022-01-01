import { ValueConstraint }          from './value-constaint';
import type { GenericEventContext } from '../../events/event-context';

/**
 * EmptyValueConstraint - Server Version
 *
 * Does not perform any checks on a value
 *
 * Values will not be constrained
 */
export class EmptyValueConstraint extends ValueConstraint {

    /**
     * Checks whether a value meets this constraint
     *
     * @returns  Values will always meet this constraint
     */
    public check(): boolean {
        return true;
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @param    value        Value to constrain
     * @returns               Unrestrained original value
     */
    public constrain(eventContext: GenericEventContext, value: number): number {
        return value;
    }
}
