import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { Condition } from './condition';
import { ConditionMultiple, conditionMultipleSchema, IConditionMultipleSource } from './condition-multiple';

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
     *
     * @returns  Whether or not this condition holds true
     */
    public check(): boolean {

        // Loop through sub conditions
        for (const item of this.subConditions) {

            // If any sub condition holds true, return true (unless inverted)
            if (item.check())
                return !this.inverted;
        }

        // If no sub conditions hold true, return false (unless inverted)
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

        // Get sub conditions from source
        const subConditions: Condition[] = await ConditionMultiple.getSubConditions(parsingContext.withExtendedPath('.subConditions'), conditionAnySource.subConditions);

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