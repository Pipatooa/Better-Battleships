import { checkAgainstSchema }                  from '../../schema-checker';
import { buildAttributeReference }             from '../attribute-references/attribute-reference-builder';
import { valueAttributeReferenceSchema }       from './sources/value-attribute-reference';
import { Value }                               from './value';
import type { GenericEventContext }            from '../../events/event-context';
import type { ParsingContext }                 from '../../parsing-context';
import type { AttributeReference }             from '../attribute-references/attribute-reference';
import type { IValueAttributeReferenceSource } from './sources/value-attribute-reference';

/**
 * ValueAttributeReference - Server Version
 *
 * When evaluated, returns the value that an attribute currently holds
 */
export class ValueAttributeReference extends Value {

    /**
     * ValueAttributeReference constructor
     *
     * @param  attributeReference Reference to an attribute to take value from
     */
    protected constructor(public readonly attributeReference: AttributeReference) {
        super();
    }

    /**
     * Evaluate this dynamic value as a number
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Value of referenced attribute
     */
    public evaluate(eventContext: GenericEventContext): number {
        return this.attributeReference.getValue(eventContext);
    }

    /**
     * Factory function to generate ValueAttributeReference from JSON scenario data
     *
     * @param    parsingContext                Context for resolving scenario data
     * @param    valueAttributeReferenceSource JSON data for ValueAttributeReference
     * @param    checkSchema                   When true, validates source JSON data against schema
     * @returns                                Created ValueAttributeReference object
     */
    public static async fromSource(parsingContext: ParsingContext, valueAttributeReferenceSource: IValueAttributeReferenceSource, checkSchema: boolean): Promise<ValueAttributeReference> {

        // Validate JSON data against schema
        if (checkSchema)
            valueAttributeReferenceSource = await checkAgainstSchema(valueAttributeReferenceSource, valueAttributeReferenceSchema, parsingContext);

        // Get attribute from source
        const attribute = await buildAttributeReference(parsingContext.withExtendedPath('.attribute'), valueAttributeReferenceSource.attribute, false);
        parsingContext.reducePath();

        // Return created ValueAttributeReference object
        return new ValueAttributeReference(attribute);
    }
}

