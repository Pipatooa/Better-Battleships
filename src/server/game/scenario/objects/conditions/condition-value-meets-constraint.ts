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
     * @param  inverted        Whether the condition result will be inverted before it is returned
     * @param  value           Value to check
     * @param  valueConstraint Constraint to check attribute value against
     * @protected
     */
    protected constructor(inverted: boolean,
                          private readonly value: Value,
                          private readonly valueConstraint: ValueConstraint) {
        super(inverted);
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

        const inverted = conditionValueMeetsConstraintSource.inverted !== undefined
            ? conditionValueMeetsConstraintSource.inverted
            : false;
        return new ConditionValueMeetsConstraint(inverted, value, valueConstraint);
    }

    /**
     * Checks whether this condition holds true
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Whether this condition holds true
     */
    public check(eventContext: GenericEventContext): boolean {
        const value: number = this.value.evaluate(eventContext);
        const result: boolean = this.valueConstraint.check(eventContext, value);
        return this.inverted ? !result : result;
    }
}
