import {ValueConstraint} from "./value-constaint";
import Joi from "joi";
import {UnpackingError} from "../unpacker";
import {clamp} from "../../../shared/utility";
import {IValueAtMostConstraintSource, valueAtMostConstraintSchema} from "./value-at-most-constraint";

/**
 * ValueInRangeConstraint - Server Version
 *
 * Checks whether a value is greater than or equal to a minimum value and less than or equal to the maximum value
 *
 * When used to constrain a value, the value will be made to be greater than or equal to the minimum value
 * and less than or equal to the maximum value
 */
export class ValueInRangeConstraint extends ValueConstraint {

    /**
     * Constructor for ValueInRangeConstraint
     * @param min Minimum value that other values can hold to meet this constraint
     * @param max Maximum value that other values can hold to meet this constraint
     */
    public constructor(public readonly min: number,
                       public readonly max: number) {
        super();
    }

    /**
     * Checks whether or not a value meets this constraint
     * @param value Value to check
     * @returns boolean -- Whether value met this constraint
     */
    public check(value: number): boolean {
        return value >= this.min && value <= this.max;
    }

    /**
     * Changes a value to meet this constraint
     * @param value Value to constrain
     * @returns newValue -- New value that meets this constraint
     */
    public constrain(value: number): number {
        return clamp(value, this.min, this.max);
    }

    /**
     * Checks whether JSON data matches the schema for this object
     * @param valueInRangeConstraintSource JSON data to verify
     * @returns boolean -- Whether or not the JSON data matched the schema
     */
    public static async checkSource(valueInRangeConstraintSource: IValueInRangeConstraintSource): Promise<boolean> {

        // Validate JSON data against schema
        try {
            await valueInRangeConstraintSchema.validateAsync(valueInRangeConstraintSource);
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
     * Factory function to generate value in range constraint from JSON scenario data
     * @param valueInRangeConstraintSource - JSON data for value in range constraint
     * @returns valueInRangeConstraint -- Created ValueInRangeConstraint object
     */
    public static async fromSource(valueInRangeConstraintSource: IValueInRangeConstraintSource) {

        // Validate JSON data against schema
        try {
            await valueInRangeConstraintSchema.validateAsync(valueInRangeConstraintSource);
        }
        catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Return scenario object
        return new ValueInRangeConstraint(valueInRangeConstraintSource.min, valueInRangeConstraintSource.max);
    }
}

/**
 * Value equal constraint interface reflecting scenario schema
 */
export interface IValueInRangeConstraintSource {
    min: number,
    max: number
}

/**
 * Schema for validating source JSON data
 */
export const valueInRangeConstraintSchema = Joi.object({
    min: Joi.number().required(),
    max: Joi.number().min(Joi.ref('min')).required()
})
