import { builtinAttributePrefix }                     from 'shared/scenario/builtin-attribute-prefix';
import { UnpackingError }                             from '../../errors/unpacking-error';
import { AttributeReference }                         from './attribute-reference';
import { attributeReferenceLocalObjectSelectors }     from './sources/attribute-reference';
import type { GenericEventContext }                   from '../../events/event-context';
import type { EventEvaluationState }                  from '../../events/event-evaluation-state';
import type { ParsingContext }                        from '../../parsing-context';
import type { Attribute }                             from '../attributes/attribute';
import type { AttributeReferenceLocalObjectSelector } from './sources/attribute-reference';

/**
 * AttributeReferenceLocal - Server Version
 *
 * Provides a fixed reference to an attribute, assigned at scenario creation time
 */
export class AttributeReferenceLocal extends AttributeReference {

    /**
     * AttributeReferenceLocal constructor
     *
     * @param  attribute Fixed attribute to reference
     */
    private constructor(private readonly attribute: Attribute) {
        super();
    }

    /**
     * Finds a local Attribute within the current parsing context
     *
     * @param    parsingContext Context for resolving objects and values when an event is triggered
     * @param    objectSelector Object selector part of attribute reference string
     * @param    attributeName  Name of attribute to reference
     * @param    builtin        Whether this attribute reference refers to a built-in value or a user defined
     * @returns                 Found Attribute object
     */
    public static async findLocalAttribute(parsingContext: ParsingContext, objectSelector: AttributeReferenceLocalObjectSelector, attributeName: string, builtin: boolean): Promise<Attribute> {

        // Verify object selector is valid for a local reference
        if (!attributeReferenceLocalObjectSelectors.includes(objectSelector))
            throw new UnpackingError(`The object selector in the attribute 'local:${objectSelector}.${attributeName}' defined at '${parsingContext.currentPath}' is not valid. Must be one of [${attributeReferenceLocalObjectSelectors.join(', ')}]`,
                parsingContext.currentFile);

        // Check is object exists to be referenced
        const attributeMaps = parsingContext.localAttributes[objectSelector];
        if (attributeMaps === undefined)
            throw new UnpackingError(`Could not find attribute 'local:${objectSelector}.${attributeName}' defined at '${parsingContext.currentPath}' in local context '${parsingContext.attributeContextName}'. No '${objectSelector}' to refer to.`,
                parsingContext.currentFile);

        // Switch between built-in attribute and regular attribute map
        const attributeMap = builtin
            ? attributeMaps[1]
            : attributeMaps[0];

        // Lookup attribute in attribute map
        const attribute = attributeMap[attributeName];
        if (attribute === undefined)
            throw new UnpackingError(`Could not find attribute 'local:${objectSelector}.${builtin ? builtinAttributePrefix : ''}${attributeName}' defined at '${parsingContext.currentPath}'. No such attribute exists on that object.`,
                parsingContext.currentFile);
        
        return attribute;
    }

    /**
     * Factory function to generate AttributeReferenceLocal from JSON scenario data
     *
     * @param    parsingContext Context for resolving objects and values when an event is triggered
     * @param    objectSelector Object selector part of attribute reference string
     * @param    attributeName  Name of attribute to reference
     * @param    builtin        Whether this attribute reference refers to a built-in value or a user defined
     * @returns                 Created AttributeReferenceLocal object
     */
    public static async fromSource(parsingContext: ParsingContext, objectSelector: AttributeReferenceLocalObjectSelector, attributeName: string, builtin: boolean): Promise<AttributeReferenceLocal> {
        const attribute = await this.findLocalAttribute(parsingContext, objectSelector, attributeName, builtin);
        return new AttributeReferenceLocal(attribute);
    }

    /**
     * Get the value of the referenced attribute
     *
     * @returns  Value of the referenced attribute
     */
    public getValue(): number {
        return this.attribute.getValue();
    }

    /**
     * Set the value of the referenced attribute
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     * @param  value                New value to assign to referenced attribute
     */
    public setValue(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext, value: number): void {
        this.attribute.setValue(value);
    }
}
