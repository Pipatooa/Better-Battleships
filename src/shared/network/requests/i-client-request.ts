import Joi                            from 'joi';
import type { IEndTurnRequest }       from './i-end-turn';
import type { IJoinTeamRequest }      from './i-join-team';
import type { IReadyRequest }         from './i-ready';
import type { IShipPlacementRequest } from './i-ship-placement';
import type { IUseAbilityRequest }    from './i-use-ability';

/**
 * Base client request which all client requests extend
 */
export interface IBaseClientRequest {
    request: ClientRequestID;
}

/**
 * Type matching any client request
 */
export type IClientRequest =
    IJoinTeamRequest |
    IReadyRequest |
    IShipPlacementRequest |
    IUseAbilityRequest |
    IEndTurnRequest;

/**
 * Intermediate variable to trick Typescript
 */
let x: IClientRequest;

/**
 * Type matching all request name strings
 */
export type ClientRequestID = typeof x.request;

/**
 * Base schema for validating a generic request object
 */
export const baseRequestSchema = Joi.object({
    request: Joi.valid().required()
}).unknown();
