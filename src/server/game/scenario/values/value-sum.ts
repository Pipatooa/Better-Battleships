import { EvaluationContext } from '../evaluation-context';
import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { Value } from './value';
import { IValueMultipleSource, ValueMultiple, valueMultipleSchema } from './value-multiple';

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
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Static value
     */
    public evaluate(evaluationContext: EvaluationContext): number {

        // Keep track of sum of values
        let sum = 0;

        // Loop through sub values and add to running sum
        for (const subValue of this.subValues) {
            sum += subValue.evaluate(evaluationContext);
        }

        // Return sum
        return sum;
    }

    /**
     * Factory function to generate ValueSum from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    valueSumSource JSON data for ValueSum
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created ValueSum object
     */
    public static async fromSource(parsingContext: ParsingContext, valueSumSource: IValueSumSource, checkSchema: boolean): Promise<ValueSum> {

        // Validate JSON data against schema
        if (checkSchema)
            valueSumSource = await checkAgainstSchema(valueSumSource, valueSumSchema, parsingContext);

        // Get sub values from source
        const subValues: Value[] = await ValueMultiple.getSubValues(parsingContext.withExtendedPath('.values'), valueSumSource.values);

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