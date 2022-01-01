import { checkAgainstSchema }                        from '../../schema-checker';
import { buildValueConstraint }                      from '../constraints/value-constraint-builder';
import { buildValue }                                from '../values/value-builder';
import { Condition }                                 from './condition';
import { conditionValueMeetsConstraintSchema }       from './sources/condition-value-meets-constraint';
import type { GenericEventContext }                  from '../../events/event-context';
import type { ParsingContext }                       from '../../parsing-context';
import type { ValueConstraint }                      from '../constraints/value-constaint';
import type { Value }                                from '../values/value';
import type { IConditionValueMeetsConstraintSource } from './sources/condition-value-meets-constraint';

/**
 * ConditionValueMeetsConstraint - Server Version
 *
 * Checks whether the value of an attribute meets a value constraint
 */
export class ConditionValueMeetsConstraint extends Condition {

    /**
     * ConditionValueMeetsConstraint constructor
     *
     * @param  value           Value to check
     * @param  valueConstraint Constraint to check attribute value against
     * @param  inverted        Whether the condition result will be inverted before it is returned
     * @protected
     */
    protected constructor(public readonly value: Value,
                          public readonly valueConstraint: ValueConstraint,
                          inverted: boolean) {
        super(inverted);
    }

    /**
     * Checks whether this condition holds true
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Whether this condition holds true
     */
    public check(eventContext: GenericEventContext): boolean {
        // Check value against value constraint
        const value: number = this.value.evaluate(eventContext);
        const result: boolean = this.valueConstraint.check(eventContext, value);

        // Return result (invert if necessary)
        return this.inverted ? !result : result;
    }

    /**
     * Factory function to generate ConditionValueMeetsConstraint from JSON scenario data
     *
     * @param    parsingContext                      Context for resolving scenario data
     * @param    conditionValueMeetsConstraintSource JSON data for ConditionValueMeetsConstraint
     * @param    checkSchema                         When true, validates source JSON data against schema
     * @returns                                      Created ConditionValueMeetsConstraint object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionValueMeetsConstraintSource: IConditionValueMeetsConstraintSource, checkSchema: boolean): Promise<ConditionValueMeetsConstraint> {

        // Validate JSON data against schema
        if (checkSchema)
            conditionValueMeetsConstraintSource = await checkAgainstSchema(conditionValueMeetsConstraintSource, conditionValueMeetsConstraintSchema, parsingContext);

        // Get value and value constraint from source
        const value = await buildValue(parsingContext.withExtendedPath('.value'), conditionValueMeetsConstraintSource.value, false);
        parsingContext.reducePath();
        const valueConstraint = await buildValueConstraint(parsingContext.withExtendedPath('.valueConstraint'), conditionValueMeetsConstraintSource.constraint, true);
        parsingContext.reducePath();

        // Return created ConditionValueMeetsConstraint object
        return new ConditionValueMeetsConstraint(value, valueConstraint, conditionValueMeetsConstraintSource.inverted !== undefined ? conditionValueMeetsConstraintSource.inverted : false);
    }
}
