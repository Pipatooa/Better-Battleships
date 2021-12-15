import { checkAgainstSchema }         from '../../schema-checker';
import { Condition }                  from './condition';
import { conditionFixedSchema }       from './sources/condition-fixed';
import type { ParsingContext }        from '../../parsing-context';
import type { IConditionFixedSource } from './sources/condition-fixed';

/**
 * ConditionFixed - Server Version
 *
 * Test condition which will return a static result when checked
 */
export class ConditionFixed extends Condition {

    /**
     * ConditionFixed constructor
     *
     * @param  result Result to return when checked
     * @protected
     */
    protected constructor(public readonly result: boolean) {
        super(false);
    }

    /**
     * Checks whether or not this condition holds true
     *
     * @returns  Whether or not this condition holds true
     */
    public check(): boolean {
        return this.result;
    }

    /**
     * Factory function to generate ConditionFixed from JSON scenario data
     *
     * @param    parsingContext       Context for resolving scenario data
     * @param    conditionFixedSource JSON data for ConditionFixed
     * @param    checkSchema          When true, validates source JSON data against schema
     * @returns                       Created ConditionFixed object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionFixedSource: IConditionFixedSource | boolean, checkSchema: boolean): Promise<ConditionFixed> {

        // Boolean source
        if (conditionFixedSource === true || conditionFixedSource === false)
            return new ConditionFixed(conditionFixedSource);

        // Validate JSON data against schema
        if (checkSchema)
            conditionFixedSource = await checkAgainstSchema(conditionFixedSource, conditionFixedSchema, parsingContext);

        return new ConditionFixed(conditionFixedSource.result);
    }
}
