import { Condition }            from './condition';
import { buildCondition }       from './condition-builder';
import type { ParsingContext }  from '../../parsing-context';
import type { ConditionSource } from './sources/condition';

/**
 * ConditionMultiple - Server Version
 *
 * Base class for conditions with multiple sub conditions which are evaluated
 */
export abstract class ConditionMultiple extends Condition {

    /**
     * ConditionMultiple constructor
     *
     * @param  subConditions List of sub conditions to check
     * @param  inverted      Whether the condition result will be inverted before it is returned
     */
    protected constructor(public readonly subConditions: Condition[],
                          inverted: boolean) {
        super(inverted);
    }

    /**
     * Converts a list of sub condition sources into a list of conditions
     *
     * @param    parsingContext      Context for resolving scenario data
     * @param    subConditionSources JSON data for sub conditions
     * @returns                      List of parsed Condition objects
     */
    protected static async getSubConditions(parsingContext: ParsingContext, subConditionSources: ConditionSource[]): Promise<Condition[]> {

        // List for created sub conditions
        const subConditions: Condition[] = [];

        // Loop through sub condition sources
        for (let i = 0; i < subConditionSources.length; i++) {

            // Build condition from sub condition source and add to list
            const subCondition = await buildCondition(parsingContext.withExtendedPath(`[${i}]`), subConditionSources[i], false);
            parsingContext.reducePath();
            subConditions.push(subCondition);
        }

        // Return list of created sub conditions
        return subConditions;
    }
}
