import { Value }               from './value';
import { buildValue }          from './value-builder';
import type { ParsingContext } from '../../parsing-context';
import type { ValueSource }    from './sources/value';

/**
 * ValueMultiple - Server Version
 *
 * Base class for values with multiple sub values which are evaluated
 */
export abstract class ValueMultiple extends Value {

    /**
     * ValueMultiple constructor
     *
     * @param  subValues List of sub values to evaluate
     * @protected
     */
    protected constructor(public readonly subValues: Value[]) {
        super();
    }

    /**
     * Converts a list of value sources into a list of values
     *
     * @param    parsingContext  Context for resolving scenario data
     * @param    subValueSources JSON data for sub values
     * @returns                  List of parsed Value objects
     * @protected
     */
    protected static async getSubValues(parsingContext: ParsingContext, subValueSources: ValueSource[]): Promise<Value[]> {

        // List for created values
        const subValues: Value[] = [];

        // Loop through sub value sources
        for (let i = 0; i < subValueSources.length; i++) {

            // Build sub value from sub value source and add to list
            const subValue: Value = await buildValue(parsingContext.withExtendedPath(`[${i}]`), subValueSources[i], true);
            subValues.push(subValue);
        }

        // Return list of created values
        return subValues;
    }
}

