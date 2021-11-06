import type { IDescriptorInfo } from './i-descriptor-info';
import type { IPatternInfo } from './i-pattern-info';

/**
 * Portable network version of Ship object
 */
export interface IShipInfo {
    descriptor: IDescriptorInfo,
    pattern: IPatternInfo
}
