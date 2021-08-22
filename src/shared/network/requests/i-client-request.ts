import Joi from 'joi';
import {IJoinTeamRequest} from './i-join-team';
import {IReadyRequest} from './i-ready';

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
    IReadyRequest;

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
