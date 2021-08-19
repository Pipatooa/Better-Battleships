import {Attribute} from '../attributes/attribute';
import {AttributeReference, attributeReferenceSchema} from '../attributes/attribute-reference';
import {IValueConstraintSource, ValueConstraint, valueConstraintSchema} from '../constraints/value-constaint';
import {buildValueConstraint} from '../constraints/value-constraint-builder';
import {ParsingContext} from '../parsing-context';
import {checkAgainstSchema} from '../schema-checker';
import {baseConditionSchema, Condition, IBaseConditionSource} from './condition';

/**
 * ConditionAttribute - Server Version
 *
 * Checks whether the value of an attribute meets a value constraint
 */
export class ConditionAttribute extends Condition {

    /**
     * ConditionTest constructor
     * @param attribute Attribute to check
     * @param valueConstraint Constraint to check attribute value against
     * @param inverted Whether or not the condition result will be inverted before it is returned
     * @protected
     */
    protected constructor(public readonly attribute: Attribute,
                          public readonly valueConstraint: ValueConstraint,
                          inverted: boolean) {
        super(inverted);
    }

    /**
     * Checks whether or not this condition holds true
     * @returns boolean -- Whether or not this condition holds true
     */
    public check(): boolean {
        // Check attribute value against value constraint
        let result: boolean = this.valueConstraint.check(this.attribute.value);

        // Return result (invert if necessary)
        return this.inverted ? !result : result;
    }

    /**
     * Factory function to generate ConditionAttribute from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param conditionAttributeSource JSON data for ConditionAttribute
     * @param checkSchema When true, validates source JSON data against schema
     * @returns conditionTest -- Created ConditionAttribute object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionAttributeSource: IConditionAttributeSource, checkSchema: boolean): Promise<ConditionAttribute> {

        // Validate JSON data against schema
        if (checkSchema)
            conditionAttributeSource = await checkAgainstSchema(conditionAttributeSource, conditionAttributeSchema, parsingContext);

        // Get attribute and value constraint from source
        let attribute: Attribute = parsingContext.getAttribute(parsingContext.withExtendedPath('.attribute'), conditionAttributeSource.attribute);
        let valueConstraint: ValueConstraint = await buildValueConstraint(parsingContext.withExtendedPath('.valueConstraint'), conditionAttributeSource.valueConstraint, true);

        // Return created ConditionAttribute object
        return new ConditionAttribute(attribute, valueConstraint, conditionAttributeSource.inverted);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IConditionAttributeSource extends IBaseConditionSource {
    type: 'attribute';
    attribute: AttributeReference;
    valueConstraint: IValueConstraintSource;
}

/**
 * Schema for validating source JSON data
 */
export const conditionAttributeSchema = baseConditionSchema.keys({
    type: 'attribute',
    attribute: attributeReferenceSchema.required(),
    valueConstraint: valueConstraintSchema.required()
});