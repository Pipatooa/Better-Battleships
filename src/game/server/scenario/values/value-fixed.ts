import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {UnpackingError} from '../unpacker';
import {Value} from './value';

/**
 * ValueRandom - Server Version
 *
 * When evaluated, returns a fixed value
 */
export class ValueFixed extends Value {

    /**
     * ValueFixed constructor
     * @param value Number that this value will always be evaluated as
     * @protected
     */
    protected constructor(public readonly value: number) {
        super();
    }

    /**
     * Evaluate this dynamic value as a number
     */
    public evaluate(): number {
        return this.value;
    }

    /**
     * Factory function to generate ValueFixed from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param valueFixedSource JSON data for ValueFixed
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns valueFixed -- Created ValueFixed object
     */
    public static async fromSource(parsingContext: ParsingContext, valueFixedSource: IValueFixedSource, skipSchemaCheck: boolean = false): Promise<ValueFixed> {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                valueFixedSource = await valueFixedSchema.validateAsync(valueFixedSource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
                throw e;
            }
        }

        // Return created ValueFixed object
        return new ValueFixed(valueFixedSource);
    }
}

/**
 * JSON source type reflecting schema
 */
export type IValueFixedSource = number;

/**
 * Schema for validation source JSON data
 */
export const valueFixedSchema = Joi.number().required();