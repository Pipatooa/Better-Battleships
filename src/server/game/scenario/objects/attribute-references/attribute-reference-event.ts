import { builtinAttributePrefix }    from 'shared/scenario/builtin-attribute-prefix';
import { UnpackingError }            from '../../errors/unpacking-error';
import { AttributeReference }        from './attribute-reference';
import type { GenericEventContext }  from '../../events/event-context';
import type { EventEvaluationState } from '../../events/event-evaluation-state';
import type { ParsingContext }       from '../../parsing-context';

/**
 * AttributeReferenceEvent - Server Version
 *
 * Provides a dynamic reference to an attribute which exists on an event
 */
export class AttributeReferenceEvent extends AttributeReference {

    /**
     * AttributeReferenceEvent constructor
     *
     * @param  attributeName Name of referenced attribute
     */
    public constructor(protected readonly attributeName: string) {
        super();
    }

    /**
     * Factory function to generate AttributeReferenceEvent from JSON scenario data
     *
     * @param    parsingContext Context for resolving objects and values when an event is triggered
     * @param    attributeName  Name of attribute to reference
     * @param    builtin        Whether this attribute reference refers to a built-in value or a user defined
     * @returns                 Created AttributeReferenceEvent object
     */
    public static async fromSource(parsingContext: ParsingContext, attributeName: string, builtin: boolean): Promise<AttributeReferenceEvent> {

        // Check is event exists to be referenced
        if (parsingContext.currentEventInfo === undefined)
            throw new UnpackingError(`Could not find attribute 'local:event.${builtinAttributePrefix}${attributeName}' defined at '${parsingContext.currentPath}'. No 'event' to refer to.`,
                parsingContext.currentFile);

        // Check is attribute exists for event
        if (!builtin || !parsingContext.currentEventInfo[1].includes(attributeName))
            throw new UnpackingError(`Could not find attribute 'local:event.${builtinAttributePrefix}${attributeName}' defined at '${parsingContext.currentPath}'. No such attribute exists for this event.`,
                parsingContext.currentFile);

        return new AttributeReferenceEvent(attributeName);
    }

    /**
     * Get the value of the referenced attribute
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Value of the referenced attribute
     */
    public getValue(eventContext: GenericEventContext): number {
        return eventContext.builtinAttributes[this.attributeName].getValue();
    }

    /**
     * Set the value of the referenced attribute
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     * @param  value                New value to assign to referenced attribute
     */
    public setValue(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext, value: number): void {
        eventContext.builtinAttributes[this.attributeName].setValue(value);
    }
}
