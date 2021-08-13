import Joi from 'joi';
import {IValueConstraintSource, ValueConstraint, valueConstraintSchema} from '../constraints/value-constaint';
import {buildValueConstraint} from '../constraints/value-constraint-builder';
import {ParsingContext} from '../parsing-context';
import {UnpackingError} from '../unpacker';
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
     * @returns attribute -- Created Attribute object
     */
    public static async fromSource(parsingContext: ParsingContext, attributeSource: IAttributeSource): Promise<Attribute> {
        // Validate JSON data against schema
        try {
            attributeSource = await attributeSchema.validateAsync(attributeSource);
        } catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Get initial value
        let initialValue: Value = await buildValue(parsingContext, attributeSource.initialValue);

        // Get constraints
        let constraints: ValueConstraint[] = [];
        for (let constraintSource of attributeSource.constraints) {
            constraints.push(await buildValueConstraint(parsingContext, constraintSource));
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