import Joi from 'joi';
import {UnpackingError} from '../unpacker';
import {Condition} from './condition';
import {ConditionMultiple, conditionMultipleSchema, IConditionMultipleSource} from './condition-multiple';

/**
 * ConditionAny - Server Version
 *
 * Condition which holds true when any sub condition holds true
 *
 * Extends ConditionMultiple
 */
export class ConditionAny extends ConditionMultiple {

    /**
     * Checks whether or not this condition holds true
     * @returns boolean -- Whether or not this condition holds true
     */
    public check(): boolean {

        // Loop through sub conditions
        for (let i = 0; i < this.subConditions.length; i++) {

            // If any sub condition holds true, return true (unless inverted)
            if (this.subConditions[i].check())
                return !this.inverted;
        }

        // If no sub conditions hold true, return false (unless inverted)
        return this.inverted;
    }

    /**
     * Factory function to generate ConditionAny from JSON scenario data
     * @param conditionAnySource JSON data for ConditionAny
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns conditionAny -- Created ConditionAny object
     */
    public static async fromSource(conditionAnySource: IConditionAnySource, skipSchemaCheck: boolean = false): Promise<ConditionAny> {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                conditionAnySource = await conditionAnySchema.validateAsync(conditionAnySource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
                throw e;
            }
        }

        // Unpack sub conditions
        let subConditions: Condition[] = await ConditionMultiple.getSubConditions(conditionAnySource.subConditions);

        // Return created ConditionAny object
        return new ConditionAny(subConditions, conditionAnySource.inverted);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IConditionAnySource extends IConditionMultipleSource {
    type: 'any';
}

/**
 * Schema for validating source JSON data
 */
export const conditionAnySchema = conditionMultipleSchema.keys({
    type: 'any'
});