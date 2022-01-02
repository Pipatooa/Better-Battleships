import { UnpackingError }                                 from '../../errors/unpacking-error';
import { builtinAttributePrefix }                         from '../attributes/sources/builtin-attributes';
import { AttributeReference }                             from './attribute-reference';
import { attributeReferenceForeignObjectSelectors }       from './sources/attribute-reference';
import type { ECA, EventContext, GenericEventContext }    from '../../events/event-context';
import type { EventEvaluationState }                      from '../../events/event-evaluation-state';
import type { ParsingContext }                            from '../../parsing-context';
import type { Attribute }                                 from '../attributes/attribute';
import type { IAttributeHolder, IBuiltinAttributeHolder } from '../attributes/attribute-holder';
import type { AttributeReferenceForeignObjectSelector }   from './sources/attribute-reference';

/**
 * AttributeReferenceForeign - Server Version
 *
 * Provides a dynamic reference to an attribute which exists on other objects depending on context
 */
export class AttributeReferenceForeign extends AttributeReference {

    /**
     * AttributeReferenceForeign constructor
     *
     * @param  objectSelector Object selector part of attribute reference string
     * @param  attributeName  Name of referenced attribute
     * @param  special        Whether this attribute reference refers to a built-in value or a user defined value
     */
    public constructor(protected readonly objectSelector: AttributeReferenceForeignObjectSelector,
                       protected readonly attributeName: string,
                       protected readonly special: boolean) {
        super();
    }

    /**
     * Factory function to generate AttributeReferenceForeign from JSON scenario data
     *
     * @param    parsingContext Context for resolving objects and values when an event is triggered
     * @param    objectSelector Object selector part of attribute reference string
     * @param    attributeName  Name of attribute to reference
     * @param    builtin        Whether this attribute reference refers to a built-in value or a user defined value
     * @returns                 Created AttributeReferenceForeign object
     */
    public static async fromSource(parsingContext: ParsingContext, objectSelector: AttributeReferenceForeignObjectSelector, attributeName: string, builtin: boolean): Promise<AttributeReferenceForeign> {

        // Verify object selector is valid for a local reference
        if (!attributeReferenceForeignObjectSelectors.includes(objectSelector))
            throw new UnpackingError(`The object selector in the attribute 'foreign:${objectSelector}.${attributeName}' defined at '${parsingContext.currentPath}' is not valid. Must be one of [${attributeReferenceForeignObjectSelectors.join(', ')}].`,
                parsingContext.currentFile);

        // Check is object exists to be referenced
        if (parsingContext.currentEventInfo?.[0].includes(objectSelector) !== true) {
            throw new UnpackingError(`Could not find attribute 'foreign:${objectSelector}.${builtin ? builtinAttributePrefix : ''}${attributeName}' defined at '${parsingContext.currentPath}'. No '${objectSelector}' to refer to.`,
                parsingContext.currentFile);
        }

        // Check if attribute exists for object
        if (!parsingContext.foreignAttributeRegistry!.registeredAttributes[objectSelector].includes(attributeName))
            throw new UnpackingError(`Could not find attribute 'foreign:${objectSelector}.${builtin ? builtinAttributePrefix : ''}${attributeName}' defined at '${parsingContext.currentPath}'. No such attribute exists on that object.`,
                parsingContext.currentFile);
        
        return new AttributeReferenceForeign(objectSelector, attributeName, builtin);
    }

    /**
     * Resolves underlying attribute that this attribute refers to under a given evaluation context
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Referenced attribute
     */
    private getAttribute(eventContext: GenericEventContext): Attribute {

        let attributeHolder: IAttributeHolder & IBuiltinAttributeHolder<any>;

        switch (this.objectSelector) {
            case 'team':
                attributeHolder = (eventContext as EventContext<'team', ECA>).foreignTeam;
                break;
            case 'player':
                attributeHolder = (eventContext as EventContext<'player', ECA>).foreignPlayer;
                break;
            case 'ship':
                attributeHolder = (eventContext as EventContext<'ship', ECA>).foreignShip;
                break;
            case 'ability':
                attributeHolder = (eventContext as EventContext<'ability', ECA>).foreignAbility;
                break;
        }

        const attributeMap = this.special ? attributeHolder.attributes : attributeHolder.builtinAttributes;
        return attributeMap[this.attributeName];
    }

    /**
     * Get the value of the referenced attribute
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Value of the referenced attribute
     */
    public getValue(eventContext: GenericEventContext): number {
        return this.getAttribute(eventContext).getValue();
    }

    /**
     * Set the value of the referenced attribute
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     * @param  value                New value to assign to referenced attribute
     */
    public setValue(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext, value: number): void {
        this.getAttribute(eventContext).setValue(value);
    }
}
