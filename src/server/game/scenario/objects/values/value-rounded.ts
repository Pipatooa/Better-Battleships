import type { EvaluationContext } from '../../evaluation-context';
import type { ParsingContext } from '../../parsing-context';
import { checkAgainstSchema } from '../../schema-checker';
import type { IValueRoundedSource } from './sources/value-rounded';
import { valueRoundedSchema } from './sources/value-rounded';
import { Value } from './value';
import { buildValue } from './value-builder';

/**
 * ValueRounded - Server Version
 *
 * When evaluated, returns a value rounded to a nearest multiple of a step value
 */
export class ValueRounded extends Value {

    /**
     * ValueRounded constructor
     *
     * @param  value Value to round
     * @param  step  Multiple to round value to
     * @protected
     */
    protected constructor(public readonly value: Value,
                          public readonly step: Value) {
        super();
    }

    /**
     * Evaluate this dynamic value as a number
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Static value
     */
    public evaluate(evaluationContext: EvaluationContext): number {

        // Evaluate step value once in-case it is changing
        const step: number = this.step.evaluate(evaluationContext);

        // Round evaluated sub-value and round to nearest multiple of step
        return Math.round(this.value.evaluate(evaluationContext) / step) * step;
    }

    /**
     * Factory function to generate ValueRounded from JSON scenario data
     *
     * @param    parsingContext     Context for resolving scenario data
     * @param    valueRoundedSource JSON data for ValueRounded
     * @param    checkSchema        When true, validates source JSON data against schema
     * @returns                     Created ValueRounded object
     */
    public static async fromSource(parsingContext: ParsingContext, valueRoundedSource: IValueRoundedSource, checkSchema: boolean): Promise<ValueRounded> {

        // Validate JSON data against schema
        if (checkSchema)
            valueRoundedSource = await checkAgainstSchema(valueRoundedSource, valueRoundedSchema, parsingContext);

        // Get value and step from source
        const value: Value = await buildValue(parsingContext.withExtendedPath('.value'), valueRoundedSource.value, true);
        const step: Value = await buildValue(parsingContext.withExtendedPath('.step'), valueRoundedSource.step, true);

        // Return created ValueRounded object
        return new ValueRounded(value, step);
    }
}
