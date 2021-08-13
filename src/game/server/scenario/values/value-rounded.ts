import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {UnpackingError} from '../unpacker';
import {baseValueSchema, IBaseValueSource, IValueSource, Value, valueSchema} from './value';
import {buildValue} from './value-builder';

/**
 * ValueRounded - Server Version
 *
 * When evaluated, returns a value rounded to a nearest multiple of a step value
 */
export class ValueRounded extends Value {

    /**
     * ValueRounded constructor
     * @param value Value to round
     * @param step Multiple to round value to
     * @protected
     */
    protected constructor(public readonly value: Value,
                          public readonly step: Value) {
        super();
    }

    /**
     * Evaluate this dynamic value as a number
     */
    public evaluate(): number {

        // Evaluate step value once in-case it is changing
        let step: number = this.step.evaluate();

        // Round evaluated sub-value and round to nearest multiple of step
        return Math.round(this.value.evaluate() / step) * step;
    }

    /**
     * Factory function to generate ValueRounded from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param valueRoundedSource JSON data for ValueRounded
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns valueFixed -- Created ValueRounded object
     */
    public static async fromSource(parsingContext: ParsingContext, valueRoundedSource: IValueRoundedSource, skipSchemaCheck: boolean = false): Promise<ValueRounded> {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                valueRoundedSource = await valueRoundedSchema.validateAsync(valueRoundedSource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
                throw e;
            }
        }

        // Get value and step
        let value: Value = await buildValue(parsingContext, valueRoundedSource.value, true);
        let step: Value = await buildValue(parsingContext, valueRoundedSource.step, true);

        // Return created ValueRounded object
        return new ValueRounded(value, step);
    }
}


/**
 * JSON source interface reflecting schema
 */
export interface IValueRoundedSource extends IBaseValueSource {
    type: 'round',
    value: IValueSource,
    step: IValueSource
}

/**
 * Schema for validating source JSON data
 */
export const valueRoundedSchema = baseValueSchema.keys({
    type: 'round',
    value: valueSchema.id().required(),
    step: valueSchema.id().required()
});