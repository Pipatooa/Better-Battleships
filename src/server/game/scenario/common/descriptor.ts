import Joi from 'joi';
import {IDescriptorInfo} from '../../../../shared/network/i-descriptor-info';
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

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     */
    public makeTransportable(): IDescriptorInfo {
        return {
            name: this.name,
            description: this.description
        };
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