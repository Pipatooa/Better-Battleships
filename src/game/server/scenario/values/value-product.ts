import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {UnpackingError} from '../unpacker';
import {Value} from './value';
import {IValueMultipleSource, ValueMultiple, valueMultipleSchema} from './value-multiple';

/**
 * ValueProduct - Server Version
 *
 * Value which evaluates to the product of all sub values
 *
 * Extends ValueMultiple
 */
export class ValueProduct extends ValueMultiple {

    /**
     * Evaluate this dynamic value as a number
     */
    public evaluate(): number {

        // Keep track of product of values
        let product: number = 1;

        // Loop through sub values and add to running product
        for (const subValue of this.subValues) {
            product *= subValue.evaluate();
        }

        // Return product
        return product;
    }

    /**
     * Factory function to generate ValueProduct from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param parsingContext Context for resolving scenario data
     * @param valueProductSource JSON data for ValueProduct
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns valueSum -- Created ValueProduct object
     */
    public static async fromSource(parsingContext: ParsingContext, valueProductSource: IValueProductSource, skipSchemaCheck: boolean = false): Promise<ValueProduct> {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                valueProductSource = await valueProductSchema.validateAsync(valueProductSource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
                throw e;
            }
        }

        // Unpack sub values
        let subValues: Value[] = await ValueMultiple.getSubValues(parsingContext, valueProductSource.values);

        // Return created ValueRandom object
        return new ValueProduct(subValues);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IValueProductSource extends IValueMultipleSource {
    type: 'product';
}

/**
 * Schema for validating source JSON data
 */
export const valueProductSchema = valueMultipleSchema.keys({
    type: 'product'
});