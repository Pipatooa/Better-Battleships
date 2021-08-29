import { ValueConstraint } from './value-constaint';

/**
 * EmptyValueConstraint - Server Version
 *
 * Does not perform any checks on a value
 *
 * Values will not be constrained
 */
export class EmptyValueConstraint extends ValueConstraint {

    /**
     * Checks whether or not a value meets this constraint
     *
     * @returns  Values will always meet this constraint
     */
    public check(): boolean {
        return true;
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    value Value to constrain
     * @returns        Unrestrained original value
     */
    public constrain(value: number): number {
        return value;
    }
}
