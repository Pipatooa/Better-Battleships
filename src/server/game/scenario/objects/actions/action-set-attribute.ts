import { checkAgainstSchema }             from '../../schema-checker';
import { buildAttributeReference }        from '../attribute-references/attribute-reference-builder';
import { buildCondition }                 from '../conditions/condition-builder';
import { buildValue }                     from '../values/value-builder';
import { Action }                         from './action';
import { actionWinSchema }                from './sources/action-win';
import type { GenericEventContext }       from '../../events/event-context';
import type { EventEvaluationState }      from '../../events/event-evaluation-state';
import type { ParsingContext }            from '../../parsing-context';
import type { AttributeReference }        from '../attribute-references/attribute-reference';
import type { Condition }                 from '../conditions/condition';
import type { Value }                     from '../values/value';
import type { IActionSetAttributeSource } from './sources/action-set-attribute';

/**
 * ActionSetAttribute - Server Version
 *
 * Action which updates the value of an attribute
 */
export class ActionSetAttribute extends Action {

    /**
     * ActionSetAttribute constructor
     *
     * @param  priority           Priority to use for event listener created for this action
     * @param  condition          Condition that must hold true for this action to execute
     * @param  attributeReference Reference to attribute to update
     * @param  value              New value to assign to the attribute
     */
    private constructor(priority: number,
                        condition: Condition,
                        private readonly attributeReference: AttributeReference,
                        private readonly value: Value) {
        super(priority, condition);
    }

    /**
     * Factory function to generate ActionSetAttribute from JSON scenario data
     *
     * @param    parsingContext           Context for resolving scenario data
     * @param    actionSetAttributeSource JSON data for ActionSetAttribute
     * @param    checkSchema              When true, validates source JSON data against schema
     * @returns                           Created ActionSetAttribute object
     */
    public static async fromSource(parsingContext: ParsingContext, actionSetAttributeSource: IActionSetAttributeSource, checkSchema: boolean): Promise<ActionSetAttribute> {

        // Validate JSON data against schema
        if (checkSchema)
            actionSetAttributeSource = await checkAgainstSchema(actionSetAttributeSource, actionWinSchema, parsingContext);

        // Get condition, attribute and value from source
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionSetAttributeSource.condition, false);
        parsingContext.reducePath();
        const attribute = await buildAttributeReference(parsingContext.withExtendedPath('.attribute'), actionSetAttributeSource.attribute, false);
        parsingContext.reducePath();
        const value = await buildValue(parsingContext.withExtendedPath('.value'), actionSetAttributeSource.value, false);
        parsingContext.reducePath();

        return new ActionSetAttribute(actionSetAttributeSource.priority ?? 0, condition, attribute, value);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     */
    public execute(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext): void {
        super.execute(eventEvaluationState, eventContext);
        if (!this.condition.check(eventContext))
            return;

        this.attributeReference.setValue(eventEvaluationState, eventContext, this.value.evaluate(eventContext));
    }
}
