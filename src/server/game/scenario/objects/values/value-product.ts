import { checkAgainstSchema }       from '../../schema-checker';
import { valueProductSchema }       from './sources/value-product';
import { ValueMultiple }            from './value-multiple';
import type { GenericEventContext } from '../../events/event-context';
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
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Static value
     */
    public evaluate(eventContext: GenericEventContext): number {

        // Keep track of product of values
        let product = 1;

        // Loop through sub values and add to running product
        for (const subValue of this.subValues) {
            product *= subValue.evaluate(eventContext);
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
        parsingContext.reducePath();

        // Return created ValueRandom object
        return new ValueProduct(subValues);
    }
}

