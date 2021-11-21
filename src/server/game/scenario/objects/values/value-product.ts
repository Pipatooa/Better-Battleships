import { checkAgainstSchema }       from '../../schema-checker';
import { valueProductSchema }       from './sources/value-product';
import { ValueMultiple }            from './value-multiple';
import type { EvaluationContext }   from '../../evaluation-context';
import type { ParsingContext }      from '../../parsing-context';
import type { IValueProductSource } from './sources/value-product';
import type { Value }               from './value';

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
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Static value
     */
    public evaluate(evaluationContext: EvaluationContext): number {

        // Keep track of product of values
        let product = 1;

        // Loop through sub values and add to running product
        for (const subValue of this.subValues) {
            product *= subValue.evaluate(evaluationContext);
        }

        // Return product
        return product;
    }

    /**
     * Factory function to generate ValueProduct from JSON scenario data
     *
     * @param    parsingContext     Context for resolving scenario data
     * @param    valueProductSource JSON data for ValueProduct
     * @param    checkSchema        When true, validates source JSON data against schema
     * @returns                     Created ValueProduct object
     */
    public static async fromSource(parsingContext: ParsingContext, valueProductSource: IValueProductSource, checkSchema: boolean): Promise<ValueProduct> {

        // Validate JSON data against schema
        if (checkSchema)
            valueProductSource = await checkAgainstSchema(valueProductSource, valueProductSchema, parsingContext);

        // Get sub values from source
        const subValues: Value[] = await ValueMultiple.getSubValues(parsingContext.withExtendedPath('.values'), valueProductSource.values);

        // Return created ValueRandom object
        return new ValueProduct(subValues);
    }
}

