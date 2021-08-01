import {UnpackingError} from "./unpacker";
import Joi from "joi";
import {IDescriptor} from "../../shared/i-descriptor";

/**
 * Descriptor Class - Server Version
 *
 * Stores a name and a description for another object
 */
export class Descriptor implements IDescriptor {
    constructor(public readonly name: string,
                public readonly description: string) { }

    /**
     * Factory function to generate descriptor from JSON scenario data
     * @param descriptorSource JSON data for descriptor
     * @returns descriptor -- Created Descriptor object
     */
    public static async fromSource(descriptorSource: IDescriptorSource): Promise<Descriptor> {

        // Validate JSON data against schema
        try {
            await descriptorSchema.validateAsync(descriptorSource);
        }
        catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
        }

        // Return descriptor object
        return new Descriptor(descriptorSource.name, descriptorSource.description);
    }
}

/**
 * Descriptor interface reflecting schema
 */
export type IDescriptorSource = IDescriptor;

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
