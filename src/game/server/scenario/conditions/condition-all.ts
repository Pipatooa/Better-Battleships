import {ConditionMultiple, conditionMultipleSchema, IConditionMultipleSource} from "./condition-multiple";
import {Condition} from "./condition";
import {UnpackingError} from "../unpacker";
import Joi from "joi";

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
     * @returns boolean -- Whether or not this condition holds true
     */
    public check(): boolean {

        // Loop through sub conditions
        for (let i = 0; i < this.subConditions.length; i++) {

            // If any sub condition holds false, return false (unless inverted)
            if (!this.subConditions[i].check())
                return this.inverted;
        }

        // If no sub conditions hold false, return true (unless inverted)
        return !this.inverted;
    }

    /**
     * Factory function to generate ConditionAll from JSON scenario data
     * @param conditionAllSource JSON data for ConditionAll
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns conditionAll -- Created ConditionAll object
     */
    public static async fromSource(conditionAllSource: IConditionAllSource, skipSchemaCheck: boolean = false): Promise<ConditionAll> {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                conditionAllSource = await conditionAllSchema.validateAsync(conditionAllSource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
            }
        }

        // Unpack sub conditions
        let subConditions: Condition[] = await ConditionMultiple.getSubConditions(conditionAllSource.subConditions);

        // Return created ConditionAll object
        return new ConditionAll(subConditions, conditionAllSource.inverted);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IConditionAllSource extends IConditionMultipleSource {
    type: "all";
}

/**
 * Schema for validating source JSON data
 */
export const conditionAllSchema = conditionMultipleSchema.keys({
    type: 'all'
});
