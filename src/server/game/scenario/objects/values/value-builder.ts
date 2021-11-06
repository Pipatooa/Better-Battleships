import type { ParsingContext } from '../../parsing-context';
import { checkAgainstSchema } from '../../schema-checker';
import type { ValueSource } from './sources/value';
import { valueSchema } from './sources/value';
import type { Value } from './value';
import { ValueAttributeReference } from './value-attribute-reference';
import { ValueFixed } from './value-fixed';
import { ValueProduct } from './value-product';
import { ValueRandom } from './value-random';
import { ValueRounded } from './value-rounded';
import { ValueSum } from './value-sum';

/**
 * Factory function to generate Value from JSON scenario data
 *
 * @param    parsingContext Context for resolving scenario data
 * @param    valueSource    JSON data for Value
 * @param    checkSchema    When true, validates source JSON data against schema
 * @returns                 Created Value object
 */
export async function buildValue(parsingContext: ParsingContext, valueSource: ValueSource, checkSchema: boolean): Promise<Value> {

    // Validate JSON data against schema
    if (checkSchema)
        valueSource = await checkAgainstSchema(valueSource, valueSchema, parsingContext);

    let value: Value;

    // If source is a number, parse as a fixed value
    if (typeof valueSource == 'number')
        value = await ValueFixed.fromSource(parsingContext, valueSource, false);
    else

        // Call appropriate factory function based on condition type
        switch (valueSource.type) {
            case 'random':
                value = await ValueRandom.fromSource(parsingContext, valueSource, false);
                break;
            case 'sum':
                value = await ValueSum.fromSource(parsingContext, valueSource, false);
                break;
            case 'product':
                value = await ValueProduct.fromSource(parsingContext, valueSource, false);
                break;
            case 'round':
                value = await ValueRounded.fromSource(parsingContext, valueSource, false);
                break;
            case 'attributeReference':
                value = await ValueAttributeReference.fromSource(parsingContext, valueSource, false);
                break;
        }

    // Return created Condition object
    return value;
}
