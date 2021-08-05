import {ValueConstraint} from "./value-constaint";
import Joi from "joi";
import {UnpackingError} from "../unpacker";

/**
 * ValueAtLeastConstraint - Server Version
 *
 * Checks whether a value is greater than or equal to a minimum value
 *
 * When used to constrain a value, the value will be made to be greater than or equal to the minimum value
 */
export class ValueAtLeastConstraint extends ValueConstraint {

    /**
     * Constructor for ValueAtLeastConstraint
     * @param min Minimum value that other values can hold to meet this constraint
     */
    public constructor(public readonly min: number) {
        super();
    }

    /**
     * Checks whether or not a value meets this constraint
     * @param value Value to check
     * @returns boolean -- Whether value met this constraint
     */
    public check(value: number): boolean {
        return value >= this.min;
    }

    /**
     * Changes a value to meet this constraint
     * @param value Value to constrain
     * @returns newValue -- New value that meets this constraint
     */
    public constrain(value: number): number {
        return Math.max(this.min, value);
    }

    /**
     * Checks whether JSON data matches the schema for this object
     * @param valueAtLeastConstraintSource JSON data to verify
     * @returns boolean -- Whether or not the JSON data matched the schema
     */
    public static async checkSource(valueAtLeastConstraintSource: IValueAtLeastConstraintSource): Promise<boolean> {

        // Validate JSON data against schema
        try {
            await valueAtLeastConstraintSchema.validateAsync(valueAtLeastConstraintSource);
        }
        catch (e) {
            if (e instanceof Joi.ValidationError)
                return false;
            throw e;
        }

        // If no error occurred, JSON matched schema
        return true;
    }

    /**
     * Factory function to generate value at least constraint from JSON scenario data
     * @param valueAtLeastConstraintSource - JSON data for value at least constraint
     * @returns valueAtLeastConstraint -- Created ValueAtLeastConstraint object
     */
    public static async fromSource(valueAtLeastConstraintSource: IValueAtLeastConstraintSource) {

        // Validate JSON data against schema
        try {
            await valueAtLeastConstraintSchema.validateAsync(valueAtLeastConstraintSource);
        }
        catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Return scenario object
        return new ValueAtLeastConstraint(valueAtLeastConstraintSource.min);
    }
}

/**
 * Value equal constraint interface reflecting scenario schema
 */
export interface IValueAtLeastConstraintSource {
    min: number
}

/**
 * Schema for validating source JSON data
 */
export const valueAtLeastConstraintSchema = Joi.object({
    min: Joi.number().required()
})
