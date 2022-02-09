import { checkAgainstSchema }               from '../../schema-checker';
import { buildValue }                       from '../values/value-builder';
import { valueEqualConstraintSchema }       from './sources/value-equal-constraint';
import { ValueConstraint }                  from './value-constaint';
import type { GenericEventContext }         from '../../events/event-context';
import type { ParsingContext }              from '../../parsing-context';
import type { Value }                       from '../values/value';
import type { IValueEqualConstraintSource } from './sources/value-equal-constraint';

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
    private constructor(private readonly target: Value) {
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

        const target = await buildValue(parsingContext.withExtendedPath('.exactly'), valueEqualConstraintSource.exactly, false);
        parsingContext.reducePath();

        return new ValueEqualConstraint(target);
    }

    /**
     * Checks whether a value meets this constraint
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @param    value        Value to check
     * @returns               Whether value met this constraint
     */
    public check(eventContext: GenericEventContext, value: number): boolean {
        return value === this.target.evaluate(eventContext);
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               New value that meets this constraint
     */
    public constrain(eventContext: GenericEventContext): number {
        return this.target.evaluate(eventContext);
    }
}
