import Joi from 'joi';
import {UnpackingError} from '../unpacker';
import {baseValueSchema, IBaseValueSource, IValueSource, Value, valueSchema} from './value';
import {buildValue} from './value-builder';

/**
 * ValueRandom - Server Version
 *
 * When evaluated, returns a random value between a minimum and maximum value
 *
 * Optionally, the value can be given as a multiple of a step value
 *
 * If generateOnce is true, the random value will be generated once and returned for all new evaluation calls
 */
export class ValueRandom extends Value {
    private generatedValue: number | undefined;

    /**
     * ValueRandom constructor
     * @param min Minimum value that the generated random value can take
     * @param max Maximum value that the generated random value can take
     * @param step Optional value that the generation random value will be a multiple of
     * @param generateOnce If true, random value will be generated once and returned for all new evaluation calls
     * @protected
     */
    protected constructor(public readonly min: Value,
                          public readonly max: Value,
                          public readonly step: Value | undefined,
                          public readonly generateOnce: boolean) {
        super();
    }

    /**
     * Gets a random value between a minimum and maximum value
     *
     * If step is not undefined, returned value will be a multiple of the step value
     * @returns number Randomly generated value
     * @protected
     */
    protected getRandom(): number {

        // Evaluate sub-values to numbers
        let min = this.min.evaluate();
        let max = this.max.evaluate();
        let step = this.step?.evaluate();

        // Returns free-floating random value between min and max
        if (step == undefined) {
            return Math.random() * (max - min) + min;
        }

        // Returns random value between min and max that is a multiple of step
        return Math.floor(Math.random() * ((max - min) / step + 1)) * step + min;
    }

    /**
     * Evaluate this dynamic value as a number
     */
    public evaluate(): number {
        if (this.generateOnce) {
            if (this.generatedValue == undefined)
                this.generatedValue = this.getRandom();

            return this.generatedValue;
        }

        return this.getRandom();
    }

    /**
     * Factory function to generate ValueRandom from JSON scenario data
     * @param valueRandomSource JSON data for ValueRandom
     * @param skipSchemaCheck When true, skips schema validation step
     * @returns valueRandom -- Created ValueRandom object
     */
    public static async fromSource(valueRandomSource: IValueRandomSource, skipSchemaCheck: boolean = false): Promise<ValueRandom> {

        // Validate JSON data against schema
        if (!skipSchemaCheck) {
            try {
                valueRandomSource = await valueRandomSchema.validateAsync(valueRandomSource);
            } catch (e) {
                if (e instanceof Joi.ValidationError)
                    throw UnpackingError.fromJoiValidationError(e);
                throw e;
            }
        }

        // Unpack min, max and step values
        let min = await buildValue(valueRandomSource.min, true);
        let max = await buildValue(valueRandomSource.max, true);
        let step = valueRandomSource.step == undefined ?
            undefined :
            await buildValue(valueRandomSource.step, true);

        // Return created ValueRandom object
        return new ValueRandom(min, max, step, valueRandomSource.generateOnce);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IValueRandomSource extends IBaseValueSource {
    type: 'random',
    min: IValueSource,
    max: IValueSource,
    step: IValueSource | undefined,
    generateOnce: boolean
}

/**
 * Schema for validating source JSON data
 */
export const valueRandomSchema = baseValueSchema.keys({
    type: 'random',
    min: valueSchema.id().required(),
    max: valueSchema.id().required(),
    step: valueSchema.id(),
    generateOnce: Joi.boolean().required()
});