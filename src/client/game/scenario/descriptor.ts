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
     * Factory function to generate Descriptor from transportable JSON
     *
     * @param    descriptorInfo JSON data for Descriptor
     * @returns                 Created Descriptor object
     */
    public static fromInfo(descriptorInfo: IDescriptorInfo): Descriptor {
        return new Descriptor(descriptorInfo.name, descriptorInfo.description);
    }
}
