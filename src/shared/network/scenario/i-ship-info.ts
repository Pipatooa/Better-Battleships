import {IDescriptorInfo} from './i-descriptor-info';
import {IPatternInfo} from './i-pattern-info';

/**
 * Portable network version of Ship object
 */
export interface IShipInfo {
    descriptor: IDescriptorInfo,
    pattern: IPatternInfo
}