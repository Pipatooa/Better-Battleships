import { clamp } from '../../../../../shared/utility';
import type { EvaluationContext } from '../../evaluation-context';
import type { ParsingContext } from '../../parsing-context';
import { checkAgainstSchema } from '../../schema-checker';
import type { Value } from '../values/value';
import { buildValue } from '../values/value-builder';
import type { IValueInRangeConstraintSource } from './sources/value-in-range-constraint';
import { valueInRangeConstraintSchema } from './sources/value-in-range-constraint';
import { ValueConstraint } from './value-constaint';

/**
 * ValueInRangeConstraint - Server Version
 *
 * Checks whether a value is greater than or equal to a minimum value and less than or equal to the maximum value
 *
 * When used to constrain a value, the value will be made to be greater than or equal to the minimum value
 * and less than or equal to the maximum value
 */
export class ValueInRangeConstraint extends ValueConstraint {

    /**
     * ValueInRangeConstraint constructor
     *
     * @param  min Minimum value that other values can hold to meet this constraint
     * @param  max Maximum value that other values can hold to meet this constraint
     */
    protected constructor(public readonly min: Value,
                          public readonly max: Value) {
        super();
    }

    /**
     * Factory function to generate ValueInRangeConstraint from JSON scenario data
     *
     * @param    parsingContext               Context for resolving scenario data
     * @param    valueInRangeConstraintSource JSON data for ValueInRangeConstraint
     * @param    checkSchema                  When true, validates source JSON data against schema
     * @returns                               Created ValueInRangeConstraint object
     */
    public static async fromSource(parsingContext: ParsingContext, valueInRangeConstraintSource: IValueInRangeConstraintSource, checkSchema: boolean): Promise<ValueInRangeConstraint> {

        // Validate JSON data against schema
        if (checkSchema)
            valueInRangeConstraintSource = await checkAgainstSchema(valueInRangeConstraintSource, valueInRangeConstraintSchema, parsingContext);

        const min: Value = await buildValue(parsingContext.withExtendedPath('.min'), valueInRangeConstraintSource.min, false);
        const max: Value = await buildValue(parsingContext.withExtendedPath('.max'), valueInRangeConstraintSource.max, false);

        // Return created ValueInRangeConstraint object
        return new ValueInRangeConstraint(min, max);
    }

    /**
     * Checks whether or not a value meets this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to check
     * @returns                    Whether value met this constraint
     */
    public check(evaluationContext: EvaluationContext, value: number): boolean {
        return value >= this.min.evaluate(evaluationContext) && value <= this.max.evaluate(evaluationContext);
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to constrain
     * @returns                    New value that meets this constraint
     */
    public constrain(evaluationContext: EvaluationContext, value: number): number {
        return clamp(value, this.min.evaluate(evaluationContext), this.max.evaluate(evaluationContext));
    }
}

