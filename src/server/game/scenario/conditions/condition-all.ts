import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { Condition } from './condition';
import { ConditionMultiple, conditionMultipleSchema, IConditionMultipleSource } from './condition-multiple';

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
     *
     * @returns  Whether or not this condition holds true
     */
    public check(): boolean {

        // Loop through sub conditions
        for (const item of this.subConditions) {

            // If any sub condition holds false, return false (unless inverted)
            if (!item.check())
                return this.inverted;
        }

        // If no sub conditions hold false, return true (unless inverted)
        return !this.inverted;
    }

    /**
     * Factory function to generate ConditionAll from JSON scenario data
     *
     * @param    parsingContext     Context for resolving scenario data
     * @param    conditionAllSource JSON data for ConditionAll
     * @param    checkSchema        When true, validates source JSON data against schema
     * @returns                     Created ConditionAll object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionAllSource: IConditionAllSource, checkSchema: boolean): Promise<ConditionAll> {

        // Validate JSON data against schema
        if (checkSchema)
            conditionAllSource = await checkAgainstSchema(conditionAllSource, conditionAllSchema, parsingContext);

        // Get sub conditions from source
        const subConditions: Condition[] = await ConditionMultiple.getSubConditions(parsingContext.withExtendedPath('.subConditions'), conditionAllSource.subConditions);

        // Return created ConditionAll object
        return new ConditionAll(subConditions, conditionAllSource.inverted);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IConditionAllSource extends IConditionMultipleSource {
    type: 'all';
}

/**
 * Schema for validating source JSON data
 */
export const conditionAllSchema = conditionMultipleSchema.keys({
    type: 'all'
});
