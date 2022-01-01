import type { IDescriptorInfo } from './i-descriptor-info';

/**
 * Portable network version of Attribute object
 */
export interface IAttributeInfo {
    descriptor: IDescriptorInfo
    value: number
}
