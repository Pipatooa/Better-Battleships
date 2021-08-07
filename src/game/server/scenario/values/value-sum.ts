import Joi from 'joi';
import {UnpackingError} from '../unpacker';
import {Value} from './value';
import {IValueMultipleSource, ValueMultiple, valueMultipleSchema} from './value-multiple';

/**
 * ValueSum - Server Version
 *
 * Value which evaluates to the sum of all sub values
 *
 * Extends ValueMultiple
 */
export class ValueSum extends ValueMultiple {

    /**
     * Evaluate this dynamic value as a number
     */
    public evaluate(): number {

        // Keep track of sum of values
        let sum: number = 0;

        // Loop through sub values and add to running sum
        this.subValues.forEach((subValue) => {
            sum += subValue.evaluate();
        });

        // Return sum
        return sum;
    }

    /**
     * Factory function to generate ValueSum from JSON scenario data
     * @param valueSumSource JSON data for ValueSum
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns valueSum -- Created ValueSum object
     */
    public static async fromSource(valueSumSource: IValueSumSource, skipSchemaCheck: boolean = false): Promise<ValueSum> {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                valueSumSource = await valueSumSchema.validateAsync(valueSumSource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
                throw e;
            }
        }

        // Unpack sub values
        let subValues: Value[] = await ValueMultiple.getSubValues(valueSumSource.values);

        // Return created ValueRandom object
        return new ValueSum(subValues);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IValueSumSource extends IValueMultipleSource {
    type: 'sum';
}

/**
 * Schema for validating source JSON data
 */
export const valueSumSchema = valueMultipleSchema.keys({
    type: 'sum'
});