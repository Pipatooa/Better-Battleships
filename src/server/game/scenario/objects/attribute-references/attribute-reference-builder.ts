import { checkAgainstSchema }                                from '../../schema-checker';
import { AttributeReferenceEvent }                           from './attribute-reference-event';
import { AttributeReferenceForeign }                         from './attribute-reference-foreign';
import { AttributeReferenceLocal }                           from './attribute-reference-local';
import { attributeReferenceRegex, attributeReferenceSchema } from './sources/attribute-reference';
import type { ParsingContext }                               from '../../parsing-context';
import type { AttributeReference }                           from './attribute-reference';
import type {
    AttributeReferenceSource,
    AttributeReferenceType,
    AttributeReferenceForeignObjectSelector,
    AttributeReferenceObjectSelector
}                                    from './sources/attribute-reference';

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
    const matches = attributeReferenceRegex.exec(attributeReferenceSource)!;
    const referenceType = matches[1] as AttributeReferenceType;
    const objectSelector = matches[2] as AttributeReferenceObjectSelector;
    const builtin = matches[3] !== undefined;
    const attributeName = matches[4];

    let attributeReference;
    switch (referenceType) {
        case 'local':
            if (objectSelector === 'event')
                attributeReference = await AttributeReferenceEvent.fromSource(parsingContext, attributeName, builtin);
            else
                attributeReference = await AttributeReferenceLocal.fromSource(parsingContext, objectSelector, attributeName, builtin);
            break;
        case 'foreign':
            attributeReference = await AttributeReferenceForeign.fromSource(parsingContext, objectSelector as AttributeReferenceForeignObjectSelector, attributeName, builtin);
            break;
    }

    return attributeReference;
}
