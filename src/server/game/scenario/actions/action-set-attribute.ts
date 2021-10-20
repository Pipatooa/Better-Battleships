import {
    AttributeReference,
    attributeReferenceSchema,
    AttributeReferenceSource
} from '../attributes/references/attribute-reference';
import { buildAttributeReference } from '../attributes/references/attribute-reference-builder';
import { Condition } from '../conditions/condition';
import { buildCondition } from '../conditions/condition-builder';
import { EvaluationContext } from '../evaluation-context';
import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { IValueSource, Value, valueSchema } from '../values/value';
import { buildValue } from '../values/value-builder';
import { Action, baseActionSchema, IBaseActionSource } from './action';
import { actionWinSchema } from './action-win';

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
        const condition: Condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionSetAttributeSource.condition, false);
        const attribute: AttributeReference = await buildAttributeReference(parsingContext.withExtendedPath('.attribute'), actionSetAttributeSource.attribute, false);
        const value: Value = await buildValue(parsingContext.withExtendedPath('.value'), actionSetAttributeSource.value, false);
        
        // Return created ActionSetAttribute object
        return new ActionSetAttribute(attribute, value, condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public execute(evaluationContext: EvaluationContext): void {

        if (!this.condition.check(evaluationContext))
            return;

        this.attributeReference.setValue(evaluationContext, this.value.evaluate(evaluationContext));
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IActionSetAttributeSource extends IBaseActionSource {
    type: 'setAttribute',
    attribute: AttributeReferenceSource,
    value: IValueSource
}

/**
 * Schema for validating source JSON data
 */
export const actionSetAttributeSchema = baseActionSchema.keys({
    type: 'setAttribute',
    attribute: attributeReferenceSchema.required(),
    value: valueSchema.required()
});
