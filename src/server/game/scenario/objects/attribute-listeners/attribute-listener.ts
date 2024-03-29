import { UnpackingError }                                              from '../../errors/unpacking-error';
import { EventListenerPrimaryPriority }                                from '../../events/event-listener';
import { checkAgainstSchema }                                          from '../../schema-checker';
import { buildAction }                                                 from '../actions/action-builder';
import { AttributeReference }                                          from '../attribute-references/attribute-reference';
import { AttributeReferenceLocal }                                     from '../attribute-references/attribute-reference-local';
import { buildValueConstraint }                                        from '../constraints/value-constraint-builder';
import { attributeListenerSchema }                                     from './sources/attribute-listener';
import type { EventContext, GenericEventContext }                      from '../../events/event-context';
import type { EventEvaluationState }                                   from '../../events/event-evaluation-state';
import type { EventListener }                                          from '../../events/event-listener';
import type { EventRegistrar }                                         from '../../events/event-registrar';
import type { ParsingContext }                                         from '../../parsing-context';
import type { Action }                                                 from '../actions/action';
import type { AttributeReferenceLocalObjectSelector }                  from '../attribute-references/sources/attribute-reference';
import type { Attribute }                                              from '../attributes/attribute';
import type { ValueConstraint }                                        from '../constraints/value-constaint';
import type { IAttributeListenerSource, AttributeListenerTriggerType } from './sources/attribute-listener';

/**
 * AttributeListener - Server Version
 *
 * Collection of actions which are executed when an attribute is updated
 */
export class AttributeListener {

    private previouslyMetConstraint = false;

    private constructor(private readonly attribute: Attribute,
                        private readonly eventRegistrar: EventRegistrar<any, any>,
                        private readonly priority: number,
                        private readonly constraint: ValueConstraint,
                        private readonly actions: Action[],
                        private readonly triggerType: AttributeListenerTriggerType) {

    }

    /**
     * Factory function to generate AttributeListener from JSON scenario data
     *
     * @param    parsingContext          Context for resolving scenario data
     * @param    attributeListenerSource JSON data for AttributeListener
     * @param    eventRegistrar          Event registrar to register internal listener under
     * @param    checkSchema             When true, validates source JSON data against schema
     * @returns                          Created AttributeListener object
     */
    public static async fromSource(parsingContext: ParsingContext, attributeListenerSource: IAttributeListenerSource, eventRegistrar: EventRegistrar<any, any>, checkSchema: boolean): Promise<AttributeListener> {

        // Validate JSON data against schema
        if (checkSchema)
            attributeListenerSource = await checkAgainstSchema(attributeListenerSource, attributeListenerSchema, parsingContext);

        // Find attribute to register this listener for
        const [referenceType, objectSelector, builtin, attributeName] = AttributeReference.deconstructReferenceString(attributeListenerSource.attribute);
        if (referenceType !== 'local')
            throw new UnpackingError(`Cannot register attribute listener at '${parsingContext.currentPath}' for attribute '${attributeListenerSource.attribute}'. Attribute type must be local.`,
                parsingContext);

        const attribute = await AttributeReferenceLocal.findLocalAttribute(parsingContext.withExtendedPath('.attribute'), objectSelector as AttributeReferenceLocalObjectSelector, attributeName, builtin);
        parsingContext.reducePath();
        const valueConstraint = await buildValueConstraint(parsingContext.withExtendedPath('.constraint'), attributeListenerSource.constraint, false);
        parsingContext.reducePath();

        const actions: Action[] = [];
        for (let i = 0; i < attributeListenerSource.actions.length; i++) {
            const actionSource = attributeListenerSource.actions[i];
            const action = await buildAction(parsingContext.withExtendedPath(`.actions[${i}]`), actionSource, false);
            parsingContext.reducePath();
            actions.push(action);
        }
        parsingContext.currentEventInfo = undefined;

        return new AttributeListener(attribute, eventRegistrar, attributeListenerSource.priority, valueConstraint, actions, attributeListenerSource.triggerType);
    }

    /**
     * Registers this attribute listener to its assigned attribute
     */
    public register(): void {
        this.attribute.registerAttributeListener(this);
    }

    /**
     * Unregisters this attribute listener from its assigned attribute
     */
    public unregister(): void {
        this.attribute.unregisterAttributeListener(this);
    }

    /**
     * Called when the value of the attribute that this listener is attached to updates
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public preQueueEventListenerCall(eventContext: EventContext<any, any, any, 'value'>): void {
        const callback = (eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext ): void =>
            this.executeActions(eventEvaluationState, eventContext as EventContext<any, any, any, 'value'>);

        const eventListener = [EventListenerPrimaryPriority.ActionDefault, this.priority, callback] as EventListener<any, string, string>;
        this.eventRegistrar.preQueueEventListenerCall(eventListener, eventContext);
    }

    /**
     * Called when the event listener for this attribute listener is evaluated
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     */
    public executeActions(eventEvaluationState: EventEvaluationState, eventContext: EventContext<any, any, any, 'value'> ): void {
        const meetsConstraint = this.constraint.check(eventContext, eventContext.value);
        let shouldExecute: boolean;

        switch (this.triggerType) {
            case 'once':
                shouldExecute = meetsConstraint && !this.previouslyMetConstraint;
                this.previouslyMetConstraint ||= meetsConstraint;
                break;
            case 'every':
                shouldExecute = meetsConstraint;
                break;
            case 'intermittent':
                shouldExecute = meetsConstraint && !this.previouslyMetConstraint;
                this.previouslyMetConstraint = meetsConstraint;
                break;
        }

        if (shouldExecute) {
            for (const action of this.actions)
                action.execute(eventEvaluationState, eventContext);
        }
    }
}
