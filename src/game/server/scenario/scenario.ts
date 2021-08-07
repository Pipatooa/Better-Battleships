import Joi from 'joi';
import {Descriptor, descriptorSchema, IDescriptorSource} from './descriptor';
import {UnpackingError} from './unpacker';

/**
 * Scenario - Server Version
 *
 * Stores all information about the scenario and it the container object for most other objects in the scenario
 */
export class Scenario {
    public constructor(public readonly descriptor: Descriptor) {
    }

    /**
     * Factory function to generate scenario from JSON scenario data
     * @param scenarioSource JSON data from 'scenario.json'
     * @returns scenario -- Created Scenario object
     */
    public static async fromSource(scenarioSource: IScenarioSource): Promise<Scenario> {

        // Validate JSON data against schema
        try {
            scenarioSource = await scenarioSchema.validateAsync(scenarioSource);
        } catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Return created Scenario object
        return new Scenario(scenarioSource.descriptor);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IScenarioSource {
    descriptor: IDescriptorSource;
}

/**
 * Schema for validating source JSON data
 */
export const scenarioSchema = Joi.object({
    descriptor: descriptorSchema.required()
}).unknown();
