import {ParsingContext} from '../parsing-context';
import {checkAgainstSchema} from '../schema-checker';
import {Condition, conditionSchema, IConditionSource} from './condition';
import {ConditionAll} from './condition-all';
import {ConditionAny} from './condition-any';
import {ConditionAttribute} from './condition-attribute';
import {ConditionSome} from './condition-some';
import {ConditionTest} from './condition-test';

/**
 * Factory function to generate Condition from JSON scenario data
 * @param parsingContext Context for resolving scenario data
 * @param conditionSource JSON data for Condition
 * @param checkSchema When true, validates source JSON data against schema
 * @returns condition -- Created Condition object
 */
export async function buildCondition(parsingContext: ParsingContext, conditionSource: IConditionSource, checkSchema: boolean): Promise<Condition> {

    // Validate JSON data against schema
    if (checkSchema)
        conditionSource = await checkAgainstSchema(conditionSource, conditionSchema, parsingContext);

    let condition: Condition;

    // Call appropriate factory function based on condition type
    switch (conditionSource.type) {
        case 'any':
            condition = await ConditionAny.fromSource(parsingContext, conditionSource, true);
            break;
        case 'all':
            condition = await ConditionAll.fromSource(parsingContext, conditionSource, true);
            break;
        case 'some':
            condition = await ConditionSome.fromSource(parsingContext, conditionSource, true);
            break;
        case 'test':
            condition = await ConditionTest.fromSource(parsingContext, conditionSource, true);
            break;
        case 'attribute':
            condition = await ConditionAttribute.fromSource(parsingContext, conditionSource, true);
            break;
    }

    // Return created Condition object
    return condition;
}
