import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {UnpackingError} from '../unpacker';
import {ValueConstraint} from './value-constaint';

/**
 * ValueEqualConstraint - Server Version
 *
 * Checks whether a value is equal to a target value
 *
 * When used to constrain a value, the value will always be constrained to the target value
 */
export class ValueEqualConstraint extends ValueConstraint {

    /**
     * ValueEqualConstraint constructor
     * @param target Value to check against
     */
    protected constructor(public readonly target: number) {
        super();
    }

    /**
     * Factory function to generate ValueEqualConstraint from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param valueEqualConstraintSource JSON data for ValueEqualConstraint
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns valueEqualConstraint -- Created ValueEqualConstraint object
     */
    public static async fromSource(parsingContext: ParsingContext, valueEqualConstraintSource: IValueEqualConstraintSource, skipSchemaCheck: boolean = false): Promise<ValueEqualConstraint> {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                valueEqualConstraintSource = await valueEqualConstraintSchema.validateAsync(valueEqualConstraintSource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
                throw e;
            }
        }

        // Return created ValueEqualConstraint object
        return new ValueEqualConstraint(valueEqualConstraintSource.exactly);
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
}

/**
 * JSON source interface reflecting schema
 */
export interface IValueEqualConstraintSource {
    exactly: number;
}

/**
 * Schema for validating source JSON data
 */
export const valueEqualConstraintSchema = Joi.object({
    exactly: Joi.number().required()
});
