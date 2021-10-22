import Joi from 'joi';
import { EvaluationContext } from '../evaluation-context';
import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { IValueSource, Value, valueSchema } from '../values/value';
import { buildValue } from '../values/value-builder';
import { ValueConstraint } from './value-constaint';

/**
 * ValueEqualConstraint - Server Version
 *
 * Checks whether a value is equal to a target value
 *
 * When used to constrain a value, the value will always be constrained to the target value
 */
export class ValueEqualConstraint extends ValueConstraint {

    /**
     * ValueEqualConstraint constructor
     *
     * @param  target Value to check against
     */
    protected constructor(public readonly target: Value) {
        super();
    }

    /**
     * Factory function to generate ValueEqualConstraint from JSON scenario data
     *
     * @param    parsingContext             Context for resolving scenario data
     * @param    valueEqualConstraintSource JSON data for ValueEqualConstraint
     * @param    checkSchema                When true, validates source JSON data against schema
     * @returns                             Created ValueEqualConstraint object
     */
    public static async fromSource(parsingContext: ParsingContext, valueEqualConstraintSource: IValueEqualConstraintSource, checkSchema: boolean): Promise<ValueEqualConstraint> {

        // Validate JSON data against schema
        if (checkSchema)
            valueEqualConstraintSource = await checkAgainstSchema(valueEqualConstraintSource, valueEqualConstraintSchema, parsingContext);
        
        const target: Value = await buildValue(parsingContext.withExtendedPath('.exactly'), valueEqualConstraintSource.exactly, false);
        
        // Return created ValueEqualConstraint object
        return new ValueEqualConstraint(target);
    }

    /**
     * Checks whether or not a value meets this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to check
     * @returns                    Whether value met this constraint
     */
    public check(evaluationContext: EvaluationContext, value: number): boolean {
        return value === this.target.evaluate(evaluationContext);
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    New value that meets this constraint
     */
    public constrain(evaluationContext: EvaluationContext): number {
        return this.target.evaluate(evaluationContext);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IValueEqualConstraintSource {
    exactly: IValueSource;
}

/**
 * Schema for validating source JSON data
 */
export const valueEqualConstraintSchema = Joi.object({
    exactly: valueSchema.required()
});
