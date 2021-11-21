import type { IDescriptorInfo } from 'shared/network/scenario/i-descriptor-info';


/**
 * Descriptor - Client Version
 *
 * Stores a name and a description for another object
 */
export class Descriptor {
    protected constructor(public readonly name: string,
                          public readonly description: string) {
    }

    /**
     * Factory function to generate Descriptor from JSON event data
     *
     * @param    descriptorSource JSON data from server
     * @returns                   Created Descriptor object
     */
    public static fromSource(descriptorSource: IDescriptorInfo): Descriptor {
        return new Descriptor(descriptorSource.name, descriptorSource.description);
    }
}
