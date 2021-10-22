import Joi from 'joi';
import { EvaluationContext } from '../evaluation-context';
import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { IValueSource, Value, valueSchema } from '../values/value';
import { buildValue } from '../values/value-builder';
import { ValueConstraint } from './value-constaint';

/**
 * ValueAtMostConstraint - Server Version
 *
 * Checks whether a value is less than or equal to a maximum value
 *
 * When used to constrain a value, the value will be made to be less than or equal to the maximum value
 */
export class ValueAtMostConstraint extends ValueConstraint {

    /**
     * ValueAtMostConstraint constructor
     *
     * @param  max Maximum value that other values can hold to meet this constraint
     */
    protected constructor(public readonly max: Value) {
        super();
    }

    /**
     * Factory function to generate ValueAtMostConstraint from JSON scenario data
     *
     * @param    parsingContext              Context for resolving scenario data
     * @param    valueAtMostConstraintSource JSON data for ValueAtMostConstraint
     * @param    checkSchema                 When true, validates source JSON data against schema
     * @returns                              Created ValueAtMostConstraint object
     */
    public static async fromSource(parsingContext: ParsingContext, valueAtMostConstraintSource: IValueAtMostConstraintSource, checkSchema: boolean): Promise<ValueAtMostConstraint> {

        // Validate JSON data against schema
        if (checkSchema)
            valueAtMostConstraintSource = await checkAgainstSchema(valueAtMostConstraintSource, valueAtMostConstraintSchema, parsingContext);
        
        const max: Value = await buildValue(parsingContext.withExtendedPath('.max'), valueAtMostConstraintSource.max, false);
        
        // Return created ValueAtMostConstraint object
        return new ValueAtMostConstraint(max);
    }

    /**
     * Checks whether or not a value meets this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to check
     * @returns                    Whether value met this constraint
     */
    public check(evaluationContext: EvaluationContext, value: number): boolean {
        return value <= this.max.evaluate(evaluationContext);
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to constrain
     * @returns                    New value that meets this constraint
     */
    public constrain(evaluationContext: EvaluationContext, value: number): number {
        return Math.min(this.max.evaluate(evaluationContext), value);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IValueAtMostConstraintSource {
    max: IValueSource;
}

/**
 * Schema for validating source JSON data
 */
export const valueAtMostConstraintSchema = Joi.object({
    max: valueSchema.required()
});
