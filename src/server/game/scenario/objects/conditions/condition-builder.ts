import { checkAgainstSchema }            from '../../schema-checker';
import { ConditionAll }                  from './condition-all';
import { ConditionAny }                  from './condition-any';
import { ConditionFixed }                from './condition-fixed';
import { ConditionSome }                 from './condition-some';
import { ConditionValueMeetsConstraint } from './condition-value-meets-constraint';
import { conditionSchema }               from './sources/condition';
import type { ParsingContext }           from '../../parsing-context';
import type { Condition }                from './condition';
import type { ConditionSource }          from './sources/condition';

/**
 * Factory function to generate Condition from JSON scenario data
 *
 * @param    parsingContext  Context for resolving scenario data
 * @param    conditionSource JSON data for Condition
 * @param    checkSchema     When true, validates source JSON data against schema
 * @returns                  Created Condition object
 */
export async function buildCondition(parsingContext: ParsingContext, conditionSource: ConditionSource, checkSchema: boolean): Promise<Condition> {

    // Empty condition
    if (Object.entries(conditionSource).length === 0)
        return await ConditionFixed.fromSource(parsingContext, conditionSource as Record<string, never>, false);

    // Validate JSON data against schema
    if (checkSchema)
        conditionSource = await checkAgainstSchema(conditionSource, conditionSchema, parsingContext);

    let condition: Condition;

    // Call appropriate factory function based on condition type
    switch (conditionSource.type) {
        case 'any':
            condition = await ConditionAny.fromSource(parsingContext, conditionSource, false);
            break;
        case 'all':
            condition = await ConditionAll.fromSource(parsingContext, conditionSource, false);
            break;
        case 'some':
            condition = await ConditionSome.fromSource(parsingContext, conditionSource, false);
            break;
        case 'fixed':
            condition = await ConditionFixed.fromSource(parsingContext, conditionSource, false);
            break;
        case 'valueMeetsConstraint':
            condition = await ConditionValueMeetsConstraint.fromSource(parsingContext, conditionSource, false);
            break;
    }

    // Return created Condition object
    return condition;
}
