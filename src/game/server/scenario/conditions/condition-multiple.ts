import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {baseConditionSchema, Condition, conditionSchema, IBaseConditionSource, IConditionSource} from './condition';
import {buildCondition} from './condition-builder';

/**
 * ConditionMultiple - Server Version
 *
 * Base class for conditions with multiple sub conditions which are evaluated
 */
export abstract class ConditionMultiple extends Condition {

    /**
     * ConditionMultiple constructor
     * @param subConditions List of sub conditions to check
     * @param inverted Whether or not the condition result will be inverted before it is returned
     * @protected
     */
    protected constructor(public readonly subConditions: Condition[],
                          inverted: boolean) {
        super(inverted);
    }

    /**
     * Converts a list of sub condition sources into a list of conditions
     * @param parsingContext Context for resolving scenario data
     * @param subConditionSources JSON data for sub conditions
     * @returns subConditions -- List of parsed Condition objects
     * @protected
     */
    protected static async getSubConditions(parsingContext: ParsingContext, subConditionSources: IConditionSource[]): Promise<Condition[]> {

        // List for created sub conditions
        let subConditions: Condition[] = [];

        // Loop through sub condition sources
        for (let i = 0; i < subConditionSources.length; i++) {

            // Build condition from sub condition source and add to list
            let subCondition = await buildCondition(parsingContext, subConditionSources[i], true);
            subConditions.push(subCondition);
        }

        // Return list of created sub conditions
        return subConditions;
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IConditionMultipleSource extends IBaseConditionSource {
    subConditions: IConditionSource[];
}

/**
 * Schema for validating source JSON data
 */
export const conditionMultipleSchema = baseConditionSchema.keys({
    subConditions: Joi.array().items(conditionSchema).min(2).required()
});