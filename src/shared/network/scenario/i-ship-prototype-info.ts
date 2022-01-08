import type { Rotation }              from '../../scenario/rotation';
import type { AbilityInfo }           from './ability-info';
import type { MultipleAttributeInfo } from './i-attribute-info';
import type { IDescriptorInfo }       from './i-descriptor-info';
import type { IRotatablePatternInfo } from './i-rotatable-pattern-info';

/**
 * Portable network version of Ship object
 */
export interface IShipPrototypeInfo {
    descriptor: IDescriptorInfo,
    pattern: IRotatablePatternInfo,
    abilities: AbilityInfo[],
    attributes: MultipleAttributeInfo
}

/**
 * Portable network version of Ship object
 *
 * Includes owner and position of ship
 */
export interface IShipInfo extends IShipPrototypeInfo {
    owner: string,
    x: number,
    y: number,
    rotation: Rotation
}
