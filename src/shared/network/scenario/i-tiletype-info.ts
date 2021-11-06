import type { IDescriptorInfo } from './i-descriptor-info';

/**
 * Portable network version of TileType object
 */
export interface ITileTypeInfo {
    descriptor: IDescriptorInfo,
    color: string,
    traversable: boolean
}
