import Joi from 'joi';
import {baseValueSchema, IBaseValueSource, IValueSource, Value, valueSchema} from './value';
import {buildValue} from './value-builder';

/**
 * ValueMultiple - Server Version
 *
 * Base class for values with multiple sub values which are evaluated
 */
export abstract class ValueMultiple extends Value {

    /**
     * ValueMultiple constructor
     * @param subValues List of sub values to evaluate
     * @protected
     */
    protected constructor(public readonly subValues: Value[]) {
        super();
    }

    /**
     * Converts a list of value sources into a list of values
     * @param subValueSources JSON data for sub values
     * @returns subValues -- List of parsed Value objects
     * @protected
     */
    protected static async getSubValues(subValueSources: IValueSource[]): Promise<Value[]> {

        // List for created values
        let subValues: Value[] = [];

        // Loop through sub value sources
        for (let i = 0; i < subValueSources.length; i++) {

            // Build sub value from sub value source and add to list
            let subValue = await buildValue(subValueSources[i], true);
            subValues.push(subValue);
        }

        // Return list of created values
        return subValues;
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IValueMultipleSource extends IBaseValueSource {
    values: IValueSource[];
}

/**
 * Schema for validating source JSON data
 */
export const valueMultipleSchema = baseValueSchema.keys({
    values: Joi.array().items(valueSchema).min(2).required()
});