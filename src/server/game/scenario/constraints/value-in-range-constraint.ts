import Joi from 'joi';
import {clamp} from '../../../../shared/utility';
import {ParsingContext} from '../parsing-context';
import {checkAgainstSchema} from '../schema-checker';
import {ValueConstraint} from './value-constaint';

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
     * ValueInRangeConstraint constructor
     * @param min Minimum value that other values can hold to meet this constraint
     * @param max Maximum value that other values can hold to meet this constraint
     */
    protected constructor(public readonly min: number,
                          public readonly max: number) {
        super();
    }

    /**
     * Factory function to generate ValueInRangeConstraint from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param valueInRangeConstraintSource JSON data for ValueInRangeConstraint
     * @param checkSchema When true, validates source JSON data against schema
     * @returns valueInRangeConstraint -- Created ValueInRangeConstraint object
     */
    public static async fromSource(parsingContext: ParsingContext, valueInRangeConstraintSource: IValueInRangeConstraintSource, checkSchema: boolean): Promise<ValueInRangeConstraint> {

        // Validate JSON data against schema
        if (checkSchema)
            valueInRangeConstraintSource = await checkAgainstSchema(valueInRangeConstraintSource, valueInRangeConstraintSchema, parsingContext);

        // Return created ValueInRangeConstraint object
        return new ValueInRangeConstraint(valueInRangeConstraintSource.min, valueInRangeConstraintSource.max);
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
}

/**
 * JSON source interface reflecting schema
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
});