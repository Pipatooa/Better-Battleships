import {ValueConstraint} from "./value-constaint";

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
     * @returns true -- Values will always meet this constraint
     */
    public check(value: number): boolean {
        return true;
    }

    /**
     * Changes a value to meet this constraint
     * @param value Value to constrain
     * @returns value -- Unrestrained original value
     */
    public constrain(value: number): number {
        return value;
    }
}
