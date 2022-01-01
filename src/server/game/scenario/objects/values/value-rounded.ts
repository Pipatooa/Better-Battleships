import { checkAgainstSchema }       from '../../schema-checker';
import { valueRoundedSchema }       from './sources/value-rounded';
import { Value }                    from './value';
import { buildValue }               from './value-builder';
import type { GenericEventContext } from '../../events/event-context';
import type { ParsingContext }      from '../../parsing-context';
import type { IValueRoundedSource } from './sources/value-rounded';

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
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Static value
     */
    public evaluate(eventContext: GenericEventContext): number {

        // Evaluate step value once in-case it is changing
        const step: number = this.step.evaluate(eventContext);

        // Round evaluated sub-value and round to nearest multiple of step
        return Math.round(this.value.evaluate(eventContext) / step) * step;
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
        const value = await buildValue(parsingContext.withExtendedPath('.value'), valueRoundedSource.value, true);
        parsingContext.reducePath();
        const step = await buildValue(parsingContext.withExtendedPath('.step'), valueRoundedSource.step, true);
        parsingContext.reducePath();

        // Return created ValueRounded object
        return new ValueRounded(value, step);
    }
}
