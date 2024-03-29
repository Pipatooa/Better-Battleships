import { checkAgainstSchema }       from '../../schema-checker';
import { ConditionMultiple }        from './condition-multiple';
import { conditionAnySchema }       from './sources/condition-any';
import type { GenericEventContext } from '../../events/event-context';
import type { ParsingContext }      from '../../parsing-context';
import type { Condition }           from './condition';
import type { IConditionAnySource } from './sources/condition-any';

/**
 * ConditionAny - Server Version
 *
 * Condition which holds true when any sub-condition holds true
 *
 * Extends ConditionMultiple
 */
export class ConditionAny extends ConditionMultiple {

    /**
     * Checks whether this condition holds true
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Whether this condition holds true
     */
    public check(eventContext: GenericEventContext): boolean {

        // Loop through sub-conditions
        for (const item of this.subConditions) {

            // If any sub-condition holds true, return true (unless inverted)
            if (item.check(eventContext))
                return !this.inverted;
        }

        // If no sub-conditions hold true, return false (unless inverted)
        return this.inverted;
    }

    /**
     * Factory function to generate ConditionAny from JSON scenario data
     *
     * @param    parsingContext     Context for resolving scenario data
     * @param    conditionAnySource JSON data for ConditionAny
     * @param    checkSchema        When true, validates source JSON data against schema
     * @returns                     Created ConditionAny object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionAnySource: IConditionAnySource, checkSchema: boolean): Promise<ConditionAny> {

        // Validate JSON data against schema
        if (checkSchema)
            conditionAnySource = await checkAgainstSchema(conditionAnySource, conditionAnySchema, parsingContext);

        // Get sub-conditions from source
        const subConditions: Condition[] = await ConditionMultiple.getSubConditions(parsingContext.withExtendedPath('.subConditions'), conditionAnySource.subConditions);
        parsingContext.reducePath();

        const inverted = conditionAnySource.inverted !== undefined
            ? conditionAnySource.inverted
            : false;
        return new ConditionAny(inverted, subConditions);
    }
}
