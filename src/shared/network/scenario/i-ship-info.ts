import type { AbilityInfo }           from './ability-info';
import type { IDescriptorInfo }       from './i-descriptor-info';
import type { IRotatablePatternInfo } from './i-rotatable-pattern-info';

/**
 * Portable network version of Ship object
 */
export interface IShipInfo {
    descriptor: IDescriptorInfo,
    pattern: IRotatablePatternInfo,
    abilities: AbilityInfo[]
}
