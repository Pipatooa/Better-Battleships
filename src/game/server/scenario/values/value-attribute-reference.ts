import Joi from 'joi';
import {Attribute} from '../attributes/attribute';
import {AttributeReference, attributeReferenceSchema} from '../attributes/attribute-reference';
import {ParsingContext} from '../parsing-context';
import {UnpackingError} from '../unpacker';
import {baseValueSchema, IBaseValueSource, Value} from './value';

/**
 * ValueAttributeReference - Server Version
 *
 * When evaluated, returns the value that an attribute currently holds
 */
export class ValueAttributeReference extends Value {
    /**
     * ValueAttributeReference constructor
     * @param attribute Attribute to take value from
     * @protected
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
        let attribute: Attribute = parsingContext.getAttribute(parsingContext, valueAttributeReferenceSource.attribute);

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