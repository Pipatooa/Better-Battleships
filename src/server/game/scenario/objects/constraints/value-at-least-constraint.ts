import type { EvaluationContext } from '../../evaluation-context';
import type { ParsingContext } from '../../parsing-context';
import { checkAgainstSchema } from '../../schema-checker';
import type { Value } from '../values/value';
import { buildValue } from '../values/value-builder';
import type { IValueAtLeastConstraintSource } from './sources/value-at-least-constraint';
import { valueAtLeastConstraintSchema } from './sources/value-at-least-constraint';
import { ValueConstraint } from './value-constaint';

/**
 * ValueAtLeastConstraint - Server Version
 *
 * Checks whether a value is greater than or equal to a minimum value
 *
 * When used to constrain a value, the value will be made to be greater than or equal to the minimum value
 */
export class ValueAtLeastConstraint extends ValueConstraint {

    /**
     * ValueAtLeastConstraint constructor
     *
     * @param  min Minimum value that other values can hold to meet this constraint
     */
    protected constructor(public readonly min: Value) {
        super();
    }

    /**
     * Factory function to generate ValueAtLeastConstraint from JSON scenario data
     *
     * @param    parsingContext               Context for resolving scenario data
     * @param    valueAtLeastConstraintSource JSON data for ValueAtLeastConstraint
     * @param    checkSchema                  When true, validates source JSON data against schema
     * @returns                               Created ValueAtLeastConstraint object
     */
    public static async fromSource(parsingContext: ParsingContext, valueAtLeastConstraintSource: IValueAtLeastConstraintSource, checkSchema: boolean): Promise<ValueAtLeastConstraint> {

        // Validate JSON data against schema
        if (checkSchema)
            valueAtLeastConstraintSource = await checkAgainstSchema(valueAtLeastConstraintSource, valueAtLeastConstraintSchema, parsingContext);
        
        const min: Value = await buildValue(parsingContext.withExtendedPath('.min'), valueAtLeastConstraintSource.min, false);
        
        // Return created ValueAtLeastConstraint object
        return new ValueAtLeastConstraint(min);
    }

    /**
     * Checks whether or not a value meets this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to check
     * @returns                    Whether value met this constraint
     */
    public check(evaluationContext: EvaluationContext, value: number): boolean {
        return value >= this.min.evaluate(evaluationContext);
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to constrain
     * @returns                    New value that meets this constraint
     */
    public constrain(evaluationContext: EvaluationContext, value: number): number {
        return Math.max(this.min.evaluate(evaluationContext), value);
    }
}

