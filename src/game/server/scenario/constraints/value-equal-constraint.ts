import {ValueConstraint} from "./value-constaint";
import Joi from "joi";
import {UnpackingError} from "../unpacker";

/**
 * ValueEqualConstraint - Server Version
 *
 * Checks whether a value is equal to a target value
 *
 * When used to constrain a value, the value will always be constrained to the target value
 */
export class ValueEqualConstraint extends ValueConstraint {

    /**
     * Constructor for ValueEqualConstraint
     * @param target Value to check against
     */
    public constructor(public readonly target: number) {
        super();
    }

    /**
     * Checks whether or not a value meets this constraint
     * @param value Value to check
     * @returns boolean -- Whether value met this constraint
     */
    public check(value: number): boolean {
        return value == this.target;
    }

    /**
     * Changes a value to meet this constraint
     * @param value Value to constrain
     * @returns newValue -- New value that meets this constraint
     */
    public constrain(value: number): number {
        return this.target;
    }

    /**
     * Checks whether JSON data matches the schema for this object
     * @param valueEqualConstraintSource JSON data to verify
     * @returns boolean -- Whether or not the JSON data matched the schema
     */
    public static async checkSource(valueEqualConstraintSource: IValueEqualConstraintSource): Promise<boolean> {

        // Validate JSON data against schema
        try {
            await valueEqualConstraintSchema.validateAsync(valueEqualConstraintSource);
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
     * Factory function to generate value equal constraint from JSON scenario data
     * @param valueEqualConstraintSource - JSON data for value equal constraint
     * @returns valueEqualConstraint -- Created ValueEqualConstraint object
     */
    public static async fromSource(valueEqualConstraintSource: IValueEqualConstraintSource): Promise<ValueEqualConstraint> {

        // Validate JSON data against schema
        try {
            await valueEqualConstraintSchema.validateAsync(valueEqualConstraintSource);
        }
        catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Return scenario object
        return new ValueEqualConstraint(valueEqualConstraintSource.exactly);
    }
}

/**
 * Value equal constraint interface reflecting scenario schema
 */
export interface IValueEqualConstraintSource {
    exactly: number
}

/**
 * Schema for validating source JSON data
 */
export const valueEqualConstraintSchema = Joi.object({
    exactly: Joi.number().required()
})
