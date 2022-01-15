import type {
    AbilityUsabilityInfo,
    IAbilityFireUsabilityInfo,
    IAbilityGenericUsabilityInfo,
    IAbilityMoveUsabilityInfo,
    IAbilityRotateUsabilityInfo
} from './ability-usability-info';
import type { MultipleAttributeInfo } from './i-attribute-info';
import type { IDescriptorInfo }       from './i-descriptor-info';
import type { IRotatablePatternInfo } from './i-rotatable-pattern-info';

/**
 * Portable network version of generic Ability object
 */
export type AbilityInfo =
    IAbilityMoveInfo |
    IAbilityRotateInfo |
    IAbilityFireInfo |
    IAbilityGenericInfo;

/**
 * Base interface for all network portable versions of Ability object
 */
export interface IBaseAbilityInfo {
    type: string,
    descriptor: IDescriptorInfo,
    icon: string,
    attributes: MultipleAttributeInfo,
    usability: AbilityUsabilityInfo
}

/**
 * Portable network version of AbilityGeneric object
 */
export interface IAbilityMoveInfo extends IBaseAbilityInfo {
    type: 'move',
    usability: IAbilityMoveUsabilityInfo
}

/**
 * Portable network version of AbilityRotate object
 */
export interface IAbilityRotateInfo extends IBaseAbilityInfo {
    type: 'rotate',
    usability: IAbilityRotateUsabilityInfo
}

/**
 * Portable network version of AbilityFire object
 */
export interface IAbilityFireInfo extends IBaseAbilityInfo {
    type: 'fire',
    effectPattern: IRotatablePatternInfo,
    usability: IAbilityFireUsabilityInfo
}

/**
 * Portable network version of AbilityGeneric object
 */
export interface IAbilityGenericInfo extends IBaseAbilityInfo {
    type: 'generic',
    buttonText: string,
    usability: IAbilityGenericUsabilityInfo
}
