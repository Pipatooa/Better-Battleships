import { Value }               from './value';
import { buildValue }          from './value-builder';
import type { ParsingContext } from '../../parsing-context';
import type { ValueSource }    from './sources/value';

/**
 * ValueMultiple - Server Version
 *
 * Base class for values with multiple sub-values which are evaluated
 */
export abstract class ValueMultiple extends Value {

    /**
     * ValueMultiple constructor
     *
     * @param  subValues Array of sub-values to evaluate
     * @protected
     */
    protected constructor(protected readonly subValues: Value[]) {
        super();
    }

    /**
     * Converts an array of value sources into an array of values
     *
     * @param    parsingContext  Context for resolving scenario data
     * @param    subValueSources JSON data for sub-values
     * @returns                  Array of parsed Value objects
     * @protected
     */
    protected static async getSubValues(parsingContext: ParsingContext, subValueSources: ValueSource[]): Promise<Value[]> {
        const subValues: Value[] = [];
        for (let i = 0; i < subValueSources.length; i++) {
            const subValue = await buildValue(parsingContext.withExtendedPath(`[${i}]`), subValueSources[i], true);
            parsingContext.reducePath();
            subValues.push(subValue);
        }

        return subValues;
    }
}

