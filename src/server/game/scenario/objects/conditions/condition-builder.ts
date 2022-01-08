import { checkAgainstSchema }                       from '../../schema-checker';
import { ConditionAll }                             from './condition-all';
import { ConditionAny }                             from './condition-any';
import { ConditionFixed }                           from './condition-fixed';
import { ConditionSome }                            from './condition-some';
import { ConditionValueMeetsConstraint }            from './condition-value-meets-constraint';
import { conditionSchema, nullableConditionSchema } from './sources/condition';
import type { ParsingContext }                      from '../../parsing-context';
import type { Condition }                           from './condition';
import type { ConditionSource }                     from './sources/condition';

/**
 * Factory function to generate Condition from JSON scenario data
 *
 * @param    parsingContext      Context for resolving scenario data
 * @param    conditionSource     JSON data for Condition
 * @param    checkSchema         When true, validates source JSON data against schema
 * @param    allowEmptyCondition If schema check is true, whether to permit empty conditions for schema check
 * @returns                      Created Condition object
 */
export async function buildCondition(parsingContext: ParsingContext, conditionSource: ConditionSource, checkSchema: false): Promise<Condition>;
export async function buildCondition(parsingContext: ParsingContext, conditionSource: ConditionSource, checkSchema: true, allowEmptyCondition: boolean): Promise<Condition>;
export async function buildCondition(parsingContext: ParsingContext, conditionSource: ConditionSource, checkSchema: boolean, allowEmptyCondition = true): Promise<Condition> {

    // Validate JSON data against schema
    if (checkSchema) {
        const schema = allowEmptyCondition ? nullableConditionSchema : conditionSchema;
        conditionSource = await checkAgainstSchema(conditionSource, schema, parsingContext);
    }

    let condition: Condition;

    // Empty condition
    if (conditionSource === null || Object.entries(conditionSource).length === 0)
        condition = new ConditionFixed(true);

    // Otherwise, call appropriate factory function based on condition type
    else
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
            case 'valueMeetsConstraint':
                condition = await ConditionValueMeetsConstraint.fromSource(parsingContext, conditionSource, false);
                break;
        }

    // Return created Condition object
    return condition;
}
