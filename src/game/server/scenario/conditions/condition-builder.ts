import Joi from 'joi';
import {UnpackingError} from '../unpacker';
import {Condition, conditionSchema, IConditionSource} from './condition';
import {ConditionAll} from './condition-all';
import {ConditionAny} from './condition-any';
import {ConditionSome} from './condition-some';
import {ConditionTest} from './condition-test';

/**
 * Factory function to generate Condition from JSON scenario data
 * @param conditionSource JSON data for Condition
 * @param skipSchemaCheck When true, skips schema validation step
 * @returns condition -- Created Condition object
 */
export async function buildCondition(conditionSource: IConditionSource, skipSchemaCheck: boolean = false): Promise<Condition> {

    // Validate JSON data against schema
    if (!skipSchemaCheck) {
        try {
            conditionSource = await conditionSchema.validateAsync(conditionSource);
        } catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }
    }

    let condition: Condition;

    // Call appropriate factory function based on condition type
    switch (conditionSource.type) {
        case 'any':
            condition = await ConditionAny.fromSource(conditionSource, true);
            break;
        case 'all':
            condition = await ConditionAll.fromSource(conditionSource, true);
            break;
        case 'some':
            condition = await ConditionSome.fromSource(conditionSource, true);
            break;
        case 'test':
            condition = await ConditionTest.fromSource(conditionSource, true);
    }

    // Return created Condition object
    return condition;
}
