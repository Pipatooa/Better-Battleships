import { GenericEventContext }      from '../../events/event-context';
import { checkAgainstSchema }       from '../../schema-checker';
import { ConditionMultiple }        from './condition-multiple';
import { conditionAllSchema }       from './sources/condition-all';
import type { ParsingContext }      from '../../parsing-context';
import type { Condition }           from './condition';
import type { IConditionAllSource } from './sources/condition-all';

/**
 * ConditionAll - Server Version
 *
 * Condition which holds true when all sub conditions hold true
 *
 * Extends ConditionMultiple
 */
export class ConditionAll extends ConditionMultiple {

    /**
     * Checks whether or not this condition holds true
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Whether or not this condition holds true
     */
    public check(eventContext: GenericEventContext): boolean {

        // Loop through sub conditions
        for (const item of this.subConditions) {

            // If any sub condition holds false, return false (unless inverted)
            if (!item.check(eventContext))
                return this.inverted;
        }

        // If no sub conditions hold false, return true (unless inverted)
        return !this.inverted;
    }

    /**
     * Factory function to generate ConditionAll from JSON scenario data
     *
     * @param    parsingContext     Context for resolving scenario data
     * @param    conditionAllSource JSON data for ConditionAll
     * @param    checkSchema        When true, validates source JSON data against schema
     * @returns                     Created ConditionAll object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionAllSource: IConditionAllSource, checkSchema: boolean): Promise<ConditionAll> {

        // Validate JSON data against schema
        if (checkSchema)
            conditionAllSource = await checkAgainstSchema(conditionAllSource, conditionAllSchema, parsingContext);

        // Get sub conditions from source
        const subConditions: Condition[] = await ConditionMultiple.getSubConditions(parsingContext.withExtendedPath('.subConditions'), conditionAllSource.subConditions);
        parsingContext.reducePath();

        // Return created ConditionAll object
        return new ConditionAll(subConditions, conditionAllSource.inverted !== undefined ? conditionAllSource.inverted : false);
    }
}
