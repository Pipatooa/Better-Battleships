import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {UnpackingError} from '../unpacker';
import {IValueSource, Value, valueSchema} from './value';
import {ValueAttributeReference} from './value-attribute-reference';
import {ValueFixed} from './value-fixed';
import {ValueProduct} from './value-product';
import {ValueRandom} from './value-random';
import {ValueRounded} from './value-rounded';
import {ValueSum} from './value-sum';

/**
 * Factory function to generate Value from JSON scenario data
 * @param parsingContext Context for resolving scenario data
 * @param valueSource JSON data for Value
 * @param skipSchemaCheck When true, skips schema validation step
 * @returns condition -- Created Condition object
 */
export async function buildValue(parsingContext: ParsingContext, valueSource: IValueSource, skipSchemaCheck: boolean = false): Promise<Value> {

    // Validate JSON data against schema
    if (!skipSchemaCheck) {
        try {
            valueSource = await valueSchema.validateAsync(valueSource);
        } catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }
    }

    let value: Value;

    // If source is a number, parse as a fixed value
    if (typeof valueSource == 'number')
        value = await ValueFixed.fromSource(parsingContext, valueSource, true);
    else

        // Call appropriate factory function based on condition type
        switch (valueSource.type) {
            case 'random':
                value = await ValueRandom.fromSource(parsingContext, valueSource, true);
                break;
            case 'sum':
                value = await ValueSum.fromSource(parsingContext, valueSource, true);
                break;
            case 'product':
                value = await ValueProduct.fromSource(parsingContext, valueSource, true);
                break;
            case 'round':
                value = await ValueRounded.fromSource(parsingContext, valueSource, true);
                break;
            case 'attributeReference':
                value = await ValueAttributeReference.fromSource(parsingContext, valueSource, true);
                break;
        }

    // Return created Condition object
    return value;
}