import { checkAgainstSchema }             from '../../schema-checker';
import { buildAttributeReference }        from '../attribute-references/attribute-reference-builder';
import { buildCondition }                 from '../conditions/condition-builder';
import { buildValue }                     from '../values/value-builder';
import { Action }                         from './action';
import { actionWinSchema }                from './sources/action-win';
import type { GenericEventContext }       from '../../events/event-context';
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
     * @param  attributeReference Reference to attribute to update
     * @param  value              New value to assign to the attribute
     * @param  condition          Condition that must hold true for this action to execute
     */
    public constructor(public readonly attributeReference: AttributeReference,
                       public readonly value: Value,
                       condition: Condition) {
        super(condition);
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

        // Return created ActionSetAttribute object
        return new ActionSetAttribute(attribute, value, condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public execute(eventContext: GenericEventContext): void {

        if (!this.condition.check(eventContext))
            return;

        this.attributeReference.setValue(eventContext, this.value.evaluate(eventContext));
    }
}
