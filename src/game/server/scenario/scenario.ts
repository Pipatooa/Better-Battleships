import {Descriptor, descriptorSchema, IDescriptorSource} from "./descriptor";
import Joi from "joi";
import {UnpackingError} from "./unpacker";

/**
 * Scenario class - Server Version
 *
 * Stores all information about the scenario and it the container object for most other objects in the scenario
 */
export class Scenario {
    public constructor(public readonly descriptor: Descriptor) { }

    /**
     * Factory function to generate scenario from JSON scenario data
     * @param scenarioSource - JSON data from 'scenario.json'
     * @returns scenario -- Created Scenario object
     */
    public static async fromSource(scenarioSource: IScenarioSource): Promise<Scenario> {

        // Validate JSON data against schema
        try {
            await scenarioSchema.validateAsync(scenarioSource);
        }
        catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
        }

        // Return scenario object
        return new Scenario(scenarioSource.descriptor);
    }
}

/**
 * Scenario interface reflecting scenario schema
 */
export interface IScenarioSource {
    descriptor: IDescriptorSource
}

/**
 * Schema for validating source JSON data
 */
export const scenarioSchema = Joi.object({
    descriptor: descriptorSchema.required()
}).unknown()
