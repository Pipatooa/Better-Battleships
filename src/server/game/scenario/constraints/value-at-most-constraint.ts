import Joi from 'joi';
import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { ValueConstraint } from './value-constaint';

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
     *
     * @param  max Maximum value that other values can hold to meet this constraint
     */
    protected constructor(public readonly max: number) {
        super();
    }

    /**
     * Factory function to generate ValueAtMostConstraint from JSON scenario data
     *
     * @param    parsingContext              Context for resolving scenario data
     * @param    valueAtMostConstraintSource JSON data for ValueAtMostConstraint
     * @param    checkSchema                 When true, validates source JSON data against schema
     * @returns                              Created ValueAtMostConstraint object
     */
    public static async fromSource(parsingContext: ParsingContext, valueAtMostConstraintSource: IValueAtMostConstraintSource, checkSchema: boolean): Promise<ValueAtMostConstraint> {

        // Validate JSON data against schema
        if (checkSchema)
            valueAtMostConstraintSource = await checkAgainstSchema(valueAtMostConstraintSource, valueAtMostConstraintSchema, parsingContext);

        // Return created ValueAtMostConstraint object
        return new ValueAtMostConstraint(valueAtMostConstraintSource.max);
    }

    /**
     * Checks whether or not a value meets this constraint
     *
     * @param    value Value to check
     * @returns        Whether value met this constraint
     */
    public check(value: number): boolean {
        return value <= this.max;
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    value Value to constrain
     * @returns        New value that meets this constraint
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
