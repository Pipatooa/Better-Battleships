import { checkAgainstSchema }                from '../../schema-checker';
import { buildValue }                        from '../values/value-builder';
import { valueAtMostConstraintSchema }       from './sources/value-at-most-constraint';
import { ValueConstraint }                   from './value-constaint';
import type { GenericEventContext }          from '../../events/event-context';
import type { ParsingContext }               from '../../parsing-context';
import type { Value }                        from '../values/value';
import type { IValueAtMostConstraintSource } from './sources/value-at-most-constraint';

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
    private constructor(private readonly max: Value) {
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

        const max = await buildValue(parsingContext.withExtendedPath('.max'), valueAtMostConstraintSource.max, false);
        parsingContext.reducePath();

        return new ValueAtMostConstraint(max);
    }

    /**
     * Checks whether a value meets this constraint
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @param    value        Value to check
     * @returns               Whether value met this constraint
     */
    public check(eventContext: GenericEventContext, value: number): boolean {
        return value <= this.max.evaluate(eventContext);
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @param    value        Value to constrain
     * @returns               New value that meets this constraint
     */
    public constrain(eventContext: GenericEventContext, value: number): number {
        return Math.min(this.max.evaluate(eventContext), value);
    }
}
