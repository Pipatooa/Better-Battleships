import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {UnpackingError} from '../unpacker';
import {ValueConstraint} from './value-constaint';

/**
 * ValueAtMostConstraint - Server Version
 *
 * Checks whether a value is less than or equal to a maximum value
 *
 * When used to constrain a value, the value will be made to be less than or equal to the maximum value
 */
export class ValueAtMostConstraint extends ValueConstraint {

    /**
     * ValueAtMostConstraint constructor
     * @param max Maximum value that other values can hold to meet this constraint
     */
    protected constructor(public readonly max: number) {
        super();
    }

    /**
     * Factory function to generate ValueAtMostConstraint from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param valueAtMostConstraintSource JSON data for ValueAtMostConstraint
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns valueAtMostConstraint -- Created ValueAtMostConstraint object
     */
    public static async fromSource(parsingContext: ParsingContext, valueAtMostConstraintSource: IValueAtMostConstraintSource, skipSchemaCheck: boolean = false) {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                valueAtMostConstraintSource = await valueAtMostConstraintSchema.validateAsync(valueAtMostConstraintSource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
                throw e;
            }
        }

        // Return created ValueAtMostConstraint object
        return new ValueAtMostConstraint(valueAtMostConstraintSource.max);
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
}

/**
 * JSON source interface reflecting schema
 */
export interface IValueAtMostConstraintSource {
    max: number;
}

/**
 * Schema for validating source JSON data
 */
export const valueAtMostConstraintSchema = Joi.object({
    max: Joi.number().required()
});
