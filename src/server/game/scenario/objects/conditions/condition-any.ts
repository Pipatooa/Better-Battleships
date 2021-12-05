import { checkAgainstSchema }       from '../../schema-checker';
import { ConditionMultiple }        from './condition-multiple';
import { conditionAnySchema }       from './sources/condition-any';
import type { EvaluationContext }   from '../../evaluation-context';
import type { ParsingContext }      from '../../parsing-context';
import type { Condition }           from './condition';
import type { IConditionAnySource } from './sources/condition-any';

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
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Whether or not this condition holds true
     */
    public check(evaluationContext: EvaluationContext): boolean {

        // Loop through sub conditions
        for (const item of this.subConditions) {

            // If any sub condition holds true, return true (unless inverted)
            if (item.check(evaluationContext))
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
        parsingContext.reducePath();

        // Return created ConditionAny object
        return new ConditionAny(subConditions, conditionAnySource.inverted !== undefined ? conditionAnySource.inverted : false);
    }
}
