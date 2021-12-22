import { UnpackingError }                        from '../../unpacker';
import { AttributeUserControlled }               from './attribute-user-controlled';
import type { ParsingContext }                   from '../../parsing-context';
import type { AttributeReferenceObjectSelector } from '../attribute-references/sources/attribute-reference';
import type { AttributeMap, AttributeMapSource } from './i-attribute-holder';

/**
 * Gets a map of attributes for an object
 *
 * @param    parsingContext Context for resolving scenario data
 * @param    attributeData  JSON data for attributes
 * @param    attributeLevel Type of object that this attribute set belongs to
 * @returns                 Created attribute map
 */
export async function getAttributes(parsingContext: ParsingContext, attributeData: AttributeMapSource, attributeLevel: AttributeReferenceObjectSelector): Promise<AttributeMap> {

    const attributes: AttributeMap = {};
    for (const [name, attributeSource] of Object.entries(attributeData)) {
        attributes[name] = await AttributeUserControlled.fromSource(parsingContext.withExtendedPath(`.${name}`), attributeSource, false);
        parsingContext.reducePath();
    }

    // Enforce that foreign attributes exist for object type
    const foreignAttributes = parsingContext.foreignAttributeRegistry!.registeredAttributes[attributeLevel as 'team' | 'player' | 'ship' | 'ability'];
    if (foreignAttributes !== undefined) {
        for (const foreignAttributeName of foreignAttributes) {
            if (attributes[foreignAttributeName] === undefined)
                throw new UnpackingError(`'${attributeLevel}.${foreignAttributeName}' is declared as a foreign attribute and must be declared on all attribute holders of type '${attributeLevel}' but was not found in '${parsingContext.currentPath}'.`,
                    parsingContext);
        }
    }

    return attributes;
}
