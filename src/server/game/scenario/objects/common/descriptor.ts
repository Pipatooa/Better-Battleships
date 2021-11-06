import type { IDescriptorInfo } from '../../../../../shared/network/scenario/i-descriptor-info';
import type { ParsingContext } from '../../parsing-context';
import { checkAgainstSchema } from '../../schema-checker';
import type { IDescriptorSource } from './sources/descriptor';
import { descriptorSchema } from './sources/descriptor';

/**
 * Descriptor - Server Version
 *
 * Stores a name and a description for another object
 */
export class Descriptor {
    protected constructor(public readonly name: string,
                public readonly description: string) {
    }

    /**
     * Factory function to generate Descriptor from JSON scenario data
     *
     * @param    parsingContext   Context for resolving scenario data
     * @param    descriptorSource JSON data for descriptor
     * @param    checkSchema      When true, validates source JSON data against schema
     * @returns                   Created Descriptor object
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
     *
     * @returns  Created DescriptorInfo object
     */
    public makeTransportable(): IDescriptorInfo {
        return {
            name: this.name,
            description: this.description
        };
    }
}

