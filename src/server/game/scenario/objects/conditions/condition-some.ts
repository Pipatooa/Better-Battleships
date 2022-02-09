import { checkAgainstSchema }        from '../../schema-checker';
import { buildValueConstraint }      from '../constraints/value-constraint-builder';
import { ConditionMultiple }         from './condition-multiple';
import { conditionSomeSchema }       from './sources/condition-some';
import type { GenericEventContext }  from '../../events/event-context';
import type { ParsingContext }       from '../../parsing-context';
import type { ValueConstraint }      from '../constraints/value-constaint';
import type { Condition }            from './condition';
import type { IConditionSomeSource } from './sources/condition-some';

/**
 * ConditionSome - Server Version
 *
 * Condition which holds true when the number of sub-conditions which hold true meet a value constraint
 *
 * Extends ConditionMultiple
 */
export class ConditionSome extends ConditionMultiple {

    /**
     * ConditionSome constructor
     *
     * @param  inverted        Whether the condition result will be inverted before it is returned
     * @param  subConditions   Array of sub-conditions to check that must hold true for the condition as a whole to hold true
     * @param  valueConstraint Value constraint defining the number of sub-conditions
     */
    private constructor(inverted: boolean,
                        subConditions: Condition[],
                        private readonly valueConstraint: ValueConstraint) {
        super(inverted, subConditions);
    }

    /**
     * Factory function to generate ConditionAll from JSON scenario data
     *
     * @param    parsingContext      Context for resolving scenario data
     * @param    conditionSomeSource JSON data for ConditionAll
     * @param    checkSchema         When true, validates source JSON data against schema
     * @returns                      Created ConditionAll object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionSomeSource: IConditionSomeSource, checkSchema: boolean): Promise<ConditionSome> {

        // Validate JSON data against schema
        if (checkSchema)
            conditionSomeSource = await checkAgainstSchema(conditionSomeSource, conditionSomeSchema, parsingContext);

        // Get sub-conditions and value constraint from source
        const subConditions: Condition[] = await ConditionMultiple.getSubConditions(parsingContext.withExtendedPath('.subConditions'), conditionSomeSource.subConditions);
        parsingContext.reducePath();
        const valueConstraint = await buildValueConstraint(parsingContext.withExtendedPath('.valueConstraint'), conditionSomeSource.valueConstraint, true);
        parsingContext.reducePath();

        const inverted = conditionSomeSource.inverted !== undefined
            ? conditionSomeSource.inverted
            : false;
        return new ConditionSome(inverted, subConditions, valueConstraint);
    }

    /**
     * Checks whether this condition holds true
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Whether this condition holds true
     */
    public check(eventContext: GenericEventContext): boolean {
        let count = 0;
        for (const item of this.subConditions)
            if (item.check(eventContext))
                count++;

        // Check whether the count of values which holds true meets the held value constraint
        const meetsConstraint: boolean = this.valueConstraint.check(eventContext, count);
        return this.inverted ? !meetsConstraint : meetsConstraint;
    }
}
