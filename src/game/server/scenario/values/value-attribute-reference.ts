import Joi from 'joi';
import {Attribute} from '../attributes/attribute';
import {AttributeReference, attributeReferenceSchema} from '../attributes/attribute-reference';
import {ParsingContext} from '../parsing-context';
import {UnpackingError} from '../unpacker';
import {baseValueSchema, IBaseValueSource, Value} from './value';

/**
 * ValueRandom - Server Version
 *
 * When evaluated, returns a random value between a minimum and maximum value
 *
 * Optionally, the value can be given as a multiple of a step value
 *
 * If generateOnce is true, the random value will be generated once and returned for all new evaluation calls
 */
export class ValueAttributeReference extends Value {
    /**
     * ValueRandom constructor
     * @param attribute     * @protected
     */
    protected constructor(public readonly attribute: Attribute) {
        super();
    }

    /**
     * Evaluate this dynamic value as a number
     */
    public evaluate(): number {
        return this.attribute.value;
    }

    /**
     * Factory function to generate ValueAttributeReference from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param valueAttributeReferenceSource JSON data for ValueAttributeReference
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns valueAttributeReference -- Created ValueAttributeReference object
     */
    public static async fromSource(parsingContext: ParsingContext, valueAttributeReferenceSource: IValueAttributeReferenceSource, skipSchemaCheck: boolean = false): Promise<ValueAttributeReference> {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                valueAttributeReferenceSource = await valueAttributeReferenceSchema.validateAsync(valueAttributeReferenceSource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
                throw e;
            }
        }

        // Get attribute
        let attribute = parsingContext.getAttribute(parsingContext, valueAttributeReferenceSource.attribute);

        // Return created ValueAttributeReference object
        return new ValueAttributeReference(attribute);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IValueAttributeReferenceSource extends IBaseValueSource {
    type: 'attributeReference',
    attribute: AttributeReference
}

/**
 * Schema for validating source JSON data
 */
export const valueAttributeReferenceSchema = baseValueSchema.keys({
    type: 'attributeReference',
    attribute: attributeReferenceSchema.required()
});