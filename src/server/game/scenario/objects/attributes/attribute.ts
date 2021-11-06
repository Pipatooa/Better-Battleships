import { EvaluationContext } from '../../evaluation-context';
import type { ParsingContext } from '../../parsing-context';
import { checkAgainstSchema } from '../../schema-checker';
import type { ValueConstraint } from '../constraints/value-constaint';
import { buildValueConstraint } from '../constraints/value-constraint-builder';
import type { Value } from '../values/value';
import { buildValue } from '../values/value-builder';
import type { IAttributeSource } from './sources/attribute';
import { attributeSchema } from './sources/attribute';

/**
 * Attribute - Server Version
 *
 * Ties a named value to an attribute holder object
 */
export class Attribute {
    protected _value: number;

    /**
     * Attribute constructor
     *
     * @param  initialValue Initial value for attribute to hold. May be dynamic value
     * @param  constraints  Constraints to apply to held value. Will be applies in order
     * @param  readonly     Whether this value should be readonly
     */
    public constructor(initialValue: Value,
                       protected readonly constraints: ValueConstraint[],
                       public readonly readonly: boolean) {
        this._value = initialValue.evaluate(new EvaluationContext());
    }

    /**
     * Get the value of this attribute
     *
     * @returns  Value of this attribute
     */
    public getValue(): number {
        return this._value;
    }

    /**
     * Set the value of this attribute
     *
     * Will constrain given value to meet all held value constraints.
     * If attribute is readonly, new value will be ignored
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     * @param  value             New value
     */
    public setValue(evaluationContext: EvaluationContext, value: number): void {
        // If value is readonly, ignore new value
        if (this.readonly)
            return;

        // Iterate through constraints and constrain value accordingly
        for (const constraint of this.constraints) {
            value = constraint.constrain(evaluationContext, value);
        }

        // Set value as new constrained value
        this._value = value;
    }

    /**
     * Factory function to generate Attribute from JSON scenario data
     *
     * @param    parsingContext  Context for resolving scenario data
     * @param    attributeSource JSON data for Attribute
     * @param    checkSchema     When true, validates source JSON data against schema
     * @returns                  Created Attribute object
     */
    public static async fromSource(parsingContext: ParsingContext, attributeSource: IAttributeSource, checkSchema: boolean): Promise<Attribute> {

        // Validate JSON data against schema
        if (checkSchema)
            attributeSource = await checkAgainstSchema(attributeSource, attributeSchema, parsingContext);

        // Get initial value
        const initialValue: Value = await buildValue(parsingContext.withExtendedPath('.initialValue'), attributeSource.initialValue, false);

        // Get constraints
        const constraints: ValueConstraint[] = [];
        for (let i = 0; i < attributeSource.constraints.length; i++) {
            const constraintSource = attributeSource.constraints[i];
            constraints.push(await buildValueConstraint(parsingContext.withExtendedPath(`.constraints[${i}]`), constraintSource, false));
        }

        // Return created Attribute object
        return new Attribute(initialValue, constraints, attributeSource.readonly);
    }
}

