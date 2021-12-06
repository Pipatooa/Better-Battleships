import type { AbilityInfo }           from './ability-info';
import type { IDescriptorInfo }       from './i-descriptor-info';
import type { IRotatablePatternInfo } from './i-rotatable-pattern-info';

/**
 * Portable network version of Ship object
 */
export interface IShipPrototypeInfo {
    descriptor: IDescriptorInfo,
    pattern: IRotatablePatternInfo,
    visibilityPattern: IRotatablePatternInfo,
    abilities: AbilityInfo[]
}

/**
 * Portable network version of Ship object
 *
 * Includes owner and position of ship
 */
export interface IShipInfo extends IShipPrototypeInfo {
    owner: string,
    x: number,
    y: number
}
