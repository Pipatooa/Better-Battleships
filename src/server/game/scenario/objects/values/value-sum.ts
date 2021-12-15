import { GenericEventContext }  from '../../events/event-context';
import { checkAgainstSchema }   from '../../schema-checker';
import { valueSumSchema }       from './sources/value-sum';
import { ValueMultiple }        from './value-multiple';
import type { ParsingContext }  from '../../parsing-context';
import type { IValueSumSource } from './sources/value-sum';
import type { Value }           from './value';

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
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Static value
     */
    public evaluate(eventContext: GenericEventContext): number {

        // Keep track of sum of values
        let sum = 0;

        // Loop through sub values and add to running sum
        for (const subValue of this.subValues) {
            sum += subValue.evaluate(eventContext);
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
        parsingContext.reducePath();

        // Return created ValueRandom object
        return new ValueSum(subValues);
    }
}

