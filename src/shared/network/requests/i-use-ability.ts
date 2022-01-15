import type { IBaseClientRequest } from './i-client-request';

/**
 * Request sent when the client wants to use an ability on a ship
 */
export type IUseAbilityRequest =
    IUseIndexedAbilityRequest |
    IUsePositionedAbilityRequest;

/**
 * Base request sent when the client wants to use an ability on a ship
 */
export interface IBaseUseAbilityRequest extends IBaseClientRequest {
    request: 'useAbility',
    ship: string,
    ability: number
}

/**
 * Request sent for abilities with indexed sub-abilities
 */
export interface IUseIndexedAbilityRequest extends IBaseUseAbilityRequest {
    index: number
}

/**
 * Request sent for abilities with positioned sub-abilities
 */
export interface IUsePositionedAbilityRequest extends IBaseUseAbilityRequest {
    x: number,
    y: number
}
