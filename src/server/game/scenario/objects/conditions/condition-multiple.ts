import { Condition }            from './condition';
import { buildCondition }       from './condition-builder';
import type { ParsingContext }  from '../../parsing-context';
import type { ConditionSource } from './sources/condition';

/**
 * ConditionMultiple - Server Version
 *
 * Base class for conditions with multiple sub-conditions which are evaluated
 */
export abstract class ConditionMultiple extends Condition {

    /**
     * ConditionMultiple constructor
     *
     * @param  inverted      Whether the condition result will be inverted before it is returned
     * @param  subConditions Array of sub-conditions to check
     */
    protected constructor(inverted: boolean,
                          protected readonly subConditions: Condition[]) {
        super(inverted);
    }

    /**
     * Converts an array of sub-condition sources into an array of conditions
     *
     * @param    parsingContext      Context for resolving scenario data
     * @param    subConditionSources JSON data for sub-conditions
     * @returns                      Array of parsed Condition objects
     */
    protected static async getSubConditions(parsingContext: ParsingContext, subConditionSources: ConditionSource[]): Promise<Condition[]> {
        const subConditions: Condition[] = [];
        for (let i = 0; i < subConditionSources.length; i++) {
            const subCondition = await buildCondition(parsingContext.withExtendedPath(`[${i}]`), subConditionSources[i], false);
            parsingContext.reducePath();
            subConditions.push(subCondition);
        }

        return subConditions;
    }
}
