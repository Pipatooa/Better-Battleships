import { GenericEventContext }       from '../../events/event-context';
import { checkAgainstSchema }        from '../../schema-checker';
import { buildValueConstraint }      from '../constraints/value-constraint-builder';
import { ConditionMultiple }         from './condition-multiple';
import { conditionSomeSchema }       from './sources/condition-some';
import type { ParsingContext }       from '../../parsing-context';
import type { ValueConstraint }      from '../constraints/value-constaint';
import type { Condition }            from './condition';
import type { IConditionSomeSource } from './sources/condition-some';

/**
 * ConditionSome - Server Version
 *
 * Condition which holds true when the number of sub conditions which hold true meet a value constraint
 *
 * Extends ConditionMultiple
 */
export class ConditionSome extends ConditionMultiple {

    /**
     * ConditionSome constructor
     *
     * @param  subConditions   List of sub conditions to check
     * @param  valueConstraint Value constraint defining the number of sub conditions
     *                         that must hold true for the condition as a whole to hold true
     * @param  inverted        Whether or not the condition result will be inverted before it is returned
     */
    public constructor(subConditions: Condition[],
                       public readonly valueConstraint: ValueConstraint,
                       inverted: boolean) {
        super(subConditions, inverted);
    }

    /**
     * Checks whether or not this condition holds true
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Whether or not this condition holds true
     */
    public check(eventContext: GenericEventContext): boolean {

        // Keep count of number of sub conditions which hold true
        let count = 0;

        // Loop through sub conditions and increment count for each condition that holds true
        for (const item of this.subConditions) {
            if (item.check(eventContext))
                count++;
        }

        // Check whether the count meets the held value constraint
        const meetsConstraint: boolean = this.valueConstraint.check(eventContext, count);

        // Return result (invert result if necessary)
        return this.inverted ? !meetsConstraint : meetsConstraint;
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

        // Get sub conditions and value constraint from source
        const subConditions: Condition[] = await ConditionMultiple.getSubConditions(parsingContext.withExtendedPath('.subConditions'), conditionSomeSource.subConditions);
        parsingContext.reducePath();
        const valueConstraint = await buildValueConstraint(parsingContext.withExtendedPath('.valueConstraint'), conditionSomeSource.valueConstraint, true);
        parsingContext.reducePath();

        // Return created ConditionSome object
        return new ConditionSome(subConditions, valueConstraint, conditionSomeSource.inverted !== undefined ? conditionSomeSource.inverted : false);
    }
}
