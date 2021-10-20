import Joi from 'joi';
import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { baseConditionSchema, Condition, IBaseConditionSource } from './condition';

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
        // Return result (invert result if necessary)
        return this.inverted ? !this.result : this.result;
    }

    /**
     * Factory function to generate ConditionFixed from JSON scenario data
     *
     * @param    parsingContext       Context for resolving scenario data
     * @param    conditionFixedSource JSON data for ConditionFixed
     * @param    checkSchema          When true, validates source JSON data against schema
     * @returns                       Created ConditionFixed object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionFixedSource: IConditionFixedSource | Record<string, never>, checkSchema: boolean): Promise<ConditionFixed> {

        // Empty condition
        if (conditionFixedSource === {})
            return new ConditionFixed(true);

        // Validate JSON data against schema
        if (checkSchema)
            conditionFixedSource = await checkAgainstSchema(conditionFixedSource, conditionFixedSchema, parsingContext);
        
        return new ConditionFixed(conditionFixedSource.result);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IConditionFixedSource extends IBaseConditionSource {
    type: 'fixed',
    result: boolean,
    inverted: never
}

/**
 * Schema for validating source JSON data
 */
export const conditionFixedSchema = baseConditionSchema.keys({
    type: 'fixed',
    result: Joi.boolean().required(),
    inverted: Joi.forbidden()
});