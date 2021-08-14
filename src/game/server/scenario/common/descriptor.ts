import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {checkAgainstSchema} from '../schema-checker';

/**
 * Descriptor - Server Version
 *
 * Stores a name and a description for another object
 */
export class Descriptor {
    constructor(public readonly name: string,
                public readonly description: string) {
    }

    /**
     * Factory function to generate descriptor from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param descriptorSource JSON data for descriptor
     * @param checkSchema When true, validates source JSON data against schema
     * @returns descriptor -- Created Descriptor object
     */
    public static async fromSource(parsingContext: ParsingContext, descriptorSource: IDescriptorSource, checkSchema: boolean): Promise<Descriptor> {

        // Validate JSON data against schema
        if (checkSchema)
            descriptorSource = await checkAgainstSchema(descriptorSource, descriptorSchema, parsingContext);

        // Return created Descriptor object
        return new Descriptor(descriptorSource.name, descriptorSource.description);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IDescriptorSource {
    name: string;
    description: string;
}

/**
 * Schema for validating source JSON data
 */
export const descriptorSchema = Joi.object({
    name: Joi
        .string()
        .min(1)
        .max(16)
        .required(),
    description: Joi
        .string()
        .required()
});
