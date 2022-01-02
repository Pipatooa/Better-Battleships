import type { IDescriptorInfo } from './i-descriptor-info';

/**
 * Portable network version of Attribute object
 */
export interface IAttributeInfo {
    descriptor: IDescriptorInfo
    value: number
}

/**
 * Type describing multiple attributes
 */
export type MultipleAttributeInfo = { [name: string]: IAttributeInfo };

/**
 * Type describing a new set of values for some attributes
 */
export type AttributeUpdates = { [name: string]: number };
