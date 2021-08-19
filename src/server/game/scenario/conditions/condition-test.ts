import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {checkAgainstSchema} from '../schema-checker';
import {baseConditionSchema, Condition, IBaseConditionSource} from './condition';

/**
 * ConditionTest - Server Version
 *
 * Test condition which will return a static result when checked
 */
export class ConditionTest extends Condition {

    /**
     * ConditionTest constructor
     * @param result Result to return when checked
     * @param inverted Whether or not the condition result will be inverted before it is returned
     * @protected
     */
    protected constructor(public readonly result: boolean,
                          inverted: boolean) {
        super(inverted);
    }

    /**
     * Checks whether or not this condition holds true
     * @returns boolean -- Whether or not this condition holds true
     */
    public check(): boolean {
        // Return result (invert result if necessary)
        return this.inverted ? !this.result : this.result;
    }

    /**
     * Factory function to generate ConditionTest from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param conditionTestSource JSON data for ConditionTest
     * @param checkSchema When true, validates source JSON data against schema
     * @returns conditionTest -- Created ConditionTest object
     */
    public static async fromSource(parsingContext: ParsingContext, conditionTestSource: IConditionTestSource, checkSchema: boolean): Promise<ConditionTest> {

        // Validate JSON data against schema
        if (checkSchema)
            conditionTestSource = await checkAgainstSchema(conditionTestSource, conditionTestSchema, parsingContext);

        // Return created ConditionTest object
        return new ConditionTest(conditionTestSource.result, conditionTestSource.inverted);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IConditionTestSource extends IBaseConditionSource {
    type: 'test';
    result: boolean;
}

/**
 * Schema for validating source JSON data
 */
export const conditionTestSchema = baseConditionSchema.keys({
    type: 'test',
    result: Joi.boolean().required()
});