import {IDescriptorInfo} from '../../../shared/network/scenario/i-descriptor-info';


/**
 * Descriptor - Client Version
 *
 * Stores a name and a description for another object
 */
export class Descriptor {
    constructor(public readonly name: string,
                public readonly description: string) {
    }

    /**
     * Factory function to generate Descriptor from JSON event data
     * @param descriptorSource JSON data from server
     * @returns descriptor -- Created Descriptor object
     */
    public static async fromSource(descriptorSource: IDescriptorInfo): Promise<Descriptor> {

        // Return created Descriptor object
        return new Descriptor(descriptorSource.name, descriptorSource.description);
    }
}