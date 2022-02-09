import { checkAgainstSchema }       from '../../schema-checker';
import { valueRandomSchema }        from './sources/value-random';
import { Value }                    from './value';
import { buildValue }               from './value-builder';
import type { GenericEventContext } from '../../events/event-context';
import type { ParsingContext }      from '../../parsing-context';
import type { IValueRandomSource }  from './sources/value-random';

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
     *
     * @param  min          Minimum value that the generated random value can take
     * @param  max          Maximum value that the generated random value can take
     * @param  step         Optional value that the generation random value will be a multiple of
     * @param  generateOnce If true, random value will be generated once and returned for all new evaluation calls
     * @protected
     */
    protected constructor(private readonly min: Value,
                          private readonly max: Value,
                          private readonly step: Value | undefined,
                          private readonly generateOnce: boolean) {
        super();
    }

    /**
     * Factory function to generate ValueRandom from JSON scenario data
     *
     * @param    parsingContext    Context for resolving scenario data
     * @param    valueRandomSource JSON data for ValueRandom
     * @param    checkSchema       When true, validates source JSON data against schema
     * @returns                    Created ValueRandom object
     */
    public static async fromSource(parsingContext: ParsingContext, valueRandomSource: IValueRandomSource, checkSchema: boolean): Promise<ValueRandom> {

        // Validate JSON data against schema
        if (checkSchema)
            valueRandomSource = await checkAgainstSchema(valueRandomSource, valueRandomSchema, parsingContext);

        // Get min, max and step from source
        const min = await buildValue(parsingContext.withExtendedPath('.min'), valueRandomSource.min, true);
        parsingContext.reducePath();
        const max = await buildValue(parsingContext.withExtendedPath('.max'), valueRandomSource.max, true);
        parsingContext.reducePath();

        let step: Value | undefined;
        if (valueRandomSource.step !== undefined) {
            await buildValue(parsingContext.withExtendedPath('.step'), valueRandomSource.step, true);
            parsingContext.reducePath();
        }

        return new ValueRandom(min, max, step, valueRandomSource.generateOnce);
    }

    /**
     * Gets a random value between a minimum and maximum value
     *
     * If step is not undefined, returned value will be a multiple of the step value
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Randomly generated value
     * @protected
     */
    private getRandom(eventContext: GenericEventContext): number {

        // Evaluate sub-values to numbers
        const min: number = this.min.evaluate(eventContext);
        const max: number = this.max.evaluate(eventContext);
        const step: number | undefined = this.step?.evaluate(eventContext);

        // Returns free-floating random value between min and max
        if (step === undefined)
            return Math.random() * (max - min) + min;

        // Otherwise, returns random value between min and max that is a multiple of step
        return Math.floor(Math.random() * ((max - min) / step + 1)) * step + min;
    }

    /**
     * Evaluate this dynamic value as a number
     *
     * @param    eventContext Context for resolving objects and values when an event is triggered
     * @returns               Static value
     */
    public evaluate(eventContext: GenericEventContext): number {
        if (this.generateOnce) {
            if (this.generatedValue === undefined)
                this.generatedValue = this.getRandom(eventContext);

            return this.generatedValue;
        }

        return this.getRandom(eventContext);
    }
}

