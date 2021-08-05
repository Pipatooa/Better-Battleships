/**
 * ValueConstraint - Server Version
 *
 * Base class for value constrains which allow a value to be checked against themselves,
 * or for a value to be changed to meet the constrain
 */
export abstract class ValueConstraint {
    /**
     * Checks whether or not a value meets this constraint
     * @param value Value to check
     * @returns boolean -- Whether value met this constraint
     */
    abstract check(value: number): boolean;

    /**
     * Changes a value to meet this constraint
     * @param value Value to constrain
     * @returns newValue -- New value that meets this constraint
     */
    abstract constrain(value: number): number;
}