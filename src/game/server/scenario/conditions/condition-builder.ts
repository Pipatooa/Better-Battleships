import {Condition, conditionSchema, IConditionSource} from "./condition";
import {UnpackingError} from "../unpacker";
import Joi from "joi";
import {ConditionAny} from "./condition-any";
import {ConditionAll} from "./condition-all";
import {ConditionSome} from "./condition-some";
import {ConditionTest} from "./condition-test";

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
        }
    }

    let condition: Condition;

    // Call appropriate factory function based on condition type
    switch (conditionSource.type) {
        case "any":
            condition = await ConditionAny.fromSource(conditionSource);
            break;
        case "all":
            condition = await ConditionAll.fromSource(conditionSource);
            break;
        case "some":
            condition = await ConditionSome.fromSource(conditionSource);
            break;
        case "test":
            condition = await ConditionTest.fromSource(conditionSource);
    }

    // Return created Condition object
    return condition;
}
