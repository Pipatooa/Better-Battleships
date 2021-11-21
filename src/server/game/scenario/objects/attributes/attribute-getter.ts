import { UnpackingError }                        from '../../unpacker';
import { Attribute }                             from './attribute';
import type { ParsingContext }                   from '../../parsing-context';
import type { AttributeReferenceObjectSelector } from '../attribute-references/sources/attribute-reference';
import type { AttributeMap, AttributeMapSource } from './i-attribute-holder';

/**
 * Gets a knownItems of attributes for an object
 *
 * @param    parsingContext Context for resolving scenario data
 * @param    attributeData  JSON data for attributes
 * @param    attributeLevel Type of object that this attribute set belongs to
 * @returns                 Created attribute knownItems
 */
export async function getAttributes(parsingContext: ParsingContext, attributeData: AttributeMapSource, attributeLevel: AttributeReferenceObjectSelector): Promise<AttributeMap> {

    const attributes: AttributeMap = {};
    for (const [name, attributeSource] of Object.entries(attributeData)) {
        attributes[name] = await Attribute.fromSource(parsingContext.withExtendedPath(`.${name}`), attributeSource, false);
    }

    // Enforce that foreign attributes exist for object type
    if (['team', 'player', 'ship'].includes(attributeLevel)) {
        for (const foreignAttributeName of parsingContext.foreignAttributeRegistry!.getRegisteredAttributeNames(attributeLevel as 'team' | 'player' | 'ship')) {
            if (attributes[foreignAttributeName] === undefined)
                throw new UnpackingError(`'${attributeLevel}.${foreignAttributeName}' is declared as a foreign attribute and must be declared on all attribute holders of type '${attributeLevel}'`, parsingContext);
        }
    }

    return attributes;
}