import { ParsingContext } from '../../parsing-context';
import { checkAgainstSchema } from '../../schema-checker';
import {
    AttributeReference, AttributeReferenceObjectSelector,
    attributeReferenceSchema,
    AttributeReferenceSource, AttributeReferenceType
} from './attribute-reference';

/**
 * Factory function to generate AttributeReference from JSON scenario data
 *
 * @param    parsingContext           Context for resolving scenario data
 * @param    attributeReferenceSource JSON data for AttributeReference
 * @param    checkSchema              When true, validates source JSON data against schema
 * @returns                           Created AttributeReference object
 */
export async function buildAttributeReference(parsingContext: ParsingContext, attributeReferenceSource: AttributeReferenceSource, checkSchema: boolean): Promise<AttributeReference> {

    // Validate JSON data against schema
    if (checkSchema)
        attributeReferenceSource = await checkAgainstSchema(attributeReferenceSource, attributeReferenceSchema, parsingContext);

    // Split attribute reference string into different components
    const matches = /^(local|foreign):(scenario|team|player|ship|ability)\.([a-zA-Z\-_\d]+)$/.exec(attributeReferenceSource);
    const referenceType = matches![1] as AttributeReferenceType;
    const objectSelector = matches![2] as AttributeReferenceObjectSelector;
    const attributeName = matches![3];
    
    let attributeReference: AttributeReference;
    
    switch (referenceType) {
        case 'local':
            attributeReference = parsingContext.getLocalAttributeReference(objectSelector, attributeName);
            break;
        case 'foreign':
            attributeReference = parsingContext.getForeignAttributeReference(objectSelector as 'team' | 'player' | 'ship', attributeName);
            break;
    }
    
    return attributeReference;
}