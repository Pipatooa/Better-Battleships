import {ValueConstraint} from "./value-constaint";
import Joi from "joi";
import {UnpackingError} from "../unpacker";

/**
 * ValueAtMostConstraint - Server Version
 *
 * Checks whether a value is less than or equal to a maximum value
 *
 * When used to constrain a value, the value will be made to be less than or equal to the maximum value
 */
export class ValueAtMostConstraint extends ValueConstraint {

    /**
     * Constructor for ValueAtMostConstraint
     * @param max Maximum value that other values can hold to meet this constraint
     */
    public constructor(public readonly max: number) {
        super();
    }

    /**
     * Checks whether or not a value meets this constraint
     * @param value Value to check
     * @returns boolean -- Whether value met this constraint
     */
    public check(value: number): boolean {
        return value <= this.max;
    }

    /**
     * Changes a value to meet this constraint
     * @param value Value to constrain
     * @returns newValue -- New value that meets this constraint
     */
    public constrain(value: number): number {
        return Math.min(this.max, value);
    }

    /**
     * Checks whether JSON data matches the schema for this object
     * @param valueAtMostConstraintSource JSON data to verify
     * @returns boolean -- Whether or not the JSON data matched the schema
     */
    public static async checkSource(valueAtMostConstraintSource: IValueAtMostConstraintSource): Promise<boolean> {

        // Validate JSON data against schema
        try {
            await valueAtMostConstraintSchema.validateAsync(valueAtMostConstraintSource);
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
     * Factory function to generate value at most constraint from JSON scenario data
     * @param valueAtMostConstraintSource - JSON data for value at most constraint
     * @returns valueAtMostConstraint -- Created ValueAtMostConstraint object
     */
    public static async fromSource(valueAtMostConstraintSource: IValueAtMostConstraintSource) {

        // Validate JSON data against schema
        try {
            await valueAtMostConstraintSchema.validateAsync(valueAtMostConstraintSource);
        }
        catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Return scenario object
        return new ValueAtMostConstraint(valueAtMostConstraintSource.max);
    }
}

/**
 * Value equal constraint interface reflecting scenario schema
 */
export interface IValueAtMostConstraintSource {
    max: number
}

/**
 * Schema for validating source JSON data
 */
export const valueAtMostConstraintSchema = Joi.object({
    max: Joi.number().required()
})
