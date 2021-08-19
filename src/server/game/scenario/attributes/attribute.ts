import Joi from 'joi';
import {IValueConstraintSource, ValueConstraint, valueConstraintSchema} from '../constraints/value-constaint';
import {buildValueConstraint} from '../constraints/value-constraint-builder';
import {ParsingContext} from '../parsing-context';
import {checkAgainstSchema} from '../schema-checker';
import {IValueSource, Value, valueSchema} from '../values/value';
import {buildValue} from '../values/value-builder';

/**
 * Attribute - Server Version
 *
 * Ties a named value to an attribute holder object
 */
export class Attribute {
    protected _value: number;

    public constructor(initialValue: Value,
                       protected readonly constraints: ValueConstraint[],
                       public readonly readonly: boolean) {
        this._value = initialValue.evaluate();
    }

    /**
     * Get the value of this attribute
     */
    public get value(): number {
        return this._value;
    }

    /**
     * Set the value of this attribute
     *
     * Will constrain given value to meet all held value constraints.
     * If attribute is readonly, new value will be ignored
     * @param value New value
     */
    public set value(value: number | Value) {
        // If value is readonly, ignore new value
        if (this.readonly)
            return;

        // If value is a dynamic value, convert it to a static number
        if (value instanceof Value)
            value = value.evaluate();

        // Iterate through constraints and constrain value accordingly
        for (let constraint of this.constraints) {
            value = constraint.constrain(value as number);
        }

        // Set value as new constrained value
        this._value = value;
    }

    /**
     * Factory function to generate Attribute from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param attributeSource JSON data for Attribute
     * @param checkSchema When true, validates source JSON data against schema
     * @returns attribute -- Created Attribute object
     */
    public static async fromSource(parsingContext: ParsingContext, attributeSource: IAttributeSource, checkSchema: boolean): Promise<Attribute> {

        // Validate JSON data against schema
        if (checkSchema)
            attributeSource = await checkAgainstSchema(attributeSource, attributeSchema, parsingContext);

        // Get initial value
        let initialValue: Value = await buildValue(parsingContext.withExtendedPath('.initialValue'), attributeSource.initialValue, false);

        // Get constraints
        let constraints: ValueConstraint[] = [];
        for (let i = 0; i < attributeSource.constraints.length; i++) {
            let constraintSource = attributeSource.constraints[i];
            constraints.push(await buildValueConstraint(parsingContext.withExtendedPath(`.constraints[${i}]`), constraintSource, false));
        }

        // Return created Attribute object
        return new Attribute(initialValue, constraints, attributeSource.readonly);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IAttributeSource {
    initialValue: IValueSource;
    constraints: IValueConstraintSource[];
    readonly: boolean;
}

/**
 * Schema for validating source JSON data
 */
export const attributeSchema = Joi.object({
    initialValue: valueSchema.required(),
    constraints: Joi.array().items(valueConstraintSchema).required(),
    readonly: Joi.boolean().required()
});