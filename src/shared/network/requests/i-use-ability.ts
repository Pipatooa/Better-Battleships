import type { IBaseClientRequest } from './i-client-request';

export type IUseAbilityRequest =
    IUseIndexedAbilityRequest |
    IUsePositionedAbilityRequest;

export interface IBaseUseAbilityRequest extends IBaseClientRequest {
    request: 'useAbility',
    ship: number,
    ability: number
}

export interface IUseIndexedAbilityRequest extends IBaseUseAbilityRequest {
    index: number
}

export interface IUsePositionedAbilityRequest extends IBaseUseAbilityRequest {
    x: number,
    y: number
}
