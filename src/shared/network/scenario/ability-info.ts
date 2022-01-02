import type { MultipleAttributeInfo } from './i-attribute-info';
import type { IDescriptorInfo }       from './i-descriptor-info';
import type { IPatternInfo }          from './i-pattern-info';

/**
 * Portable network version of generic Ability object
 */
export type AbilityInfo =
    IAbilityMoveInfo |
    IAbilityRotateInfo |
    IAbilityFireInfo;

/**
 * Base interface for all network portable version of Ability object
 */
export interface IBaseAbilityInfo {
    type: string,
    descriptor: IDescriptorInfo,
    icon: string,
    attributes: MultipleAttributeInfo,
    usable: boolean
}

/**
 * Portable network version of AbilityFire object
 */
export interface IAbilityMoveInfo extends IBaseAbilityInfo {
    type: 'move',
    pattern: IPatternInfo
}

/**
 * Portable network version of AbilityFire object
 */
export interface IAbilityRotateInfo extends IBaseAbilityInfo {
    type: 'rotate',
    rot90: boolean,
    rot180: boolean,
    rot270: boolean
}

/**
 * Portable network version of AbilityFire object
 */
export interface IAbilityFireInfo extends IBaseAbilityInfo {
    type: 'fire',
    selectionPattern: IPatternInfo,
    effectPattern: IPatternInfo
}
