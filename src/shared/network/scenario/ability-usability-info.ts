import type { IRotatablePatternInfo } from './i-rotatable-pattern-info';

/**
 * Type matching any generic ability's usability
 */
export type AbilityUsabilityInfo =
    IAbilityMoveUsabilityInfo |
    IAbilityRotateUsabilityInfo |
    IAbilityFireUsabilityInfo;

/**
 * Enum describing usability of an ability's sub-abilities
 */
export const enum SubAbilityUsability {
    NotUsable,
    Unknown,
    Invalid,
    Valid
}

/**
 * Offset that needs to be applied to convert a SubAbilityUsability number into a [Unknown, Invalid, Valid] array index
 */
export const subAbilityUsabilityIndexOffset = -SubAbilityUsability.Unknown;

/**
 * Base interface for all objects describing an ability's usability
 */
export interface IBaseAbilityUsabilityInfo {
    usable: boolean;
}

/**
 * Interface describing the usability of an AbilityMove object
 */
export interface IAbilityMoveUsabilityInfo extends IBaseAbilityUsabilityInfo {
    pattern: IRotatablePatternInfo;
}

/**
 * Interface describing the usability of an AbilityRotate object
 */
export interface IAbilityRotateUsabilityInfo extends IBaseAbilityUsabilityInfo {
    rotations: [SubAbilityUsability, SubAbilityUsability, SubAbilityUsability]
}

/**
 * Interface describing the usability of an AbilityFire object
 */
export interface IAbilityFireUsabilityInfo extends IBaseAbilityUsabilityInfo {
    pattern: IRotatablePatternInfo
}
