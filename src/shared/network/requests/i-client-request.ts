import Joi from 'joi';
import {IJoinTeamRequest} from './i-join-team';
import {IReadyRequest} from './i-ready';

export interface IBaseClientRequest {
    request: ClientRequestID
}

export type IClientRequest =
    IJoinTeamRequest |
    IReadyRequest;

let x: IClientRequest;
export type ClientRequestID = typeof x.request;

export const baseRequestSchema = Joi.object({
    request: Joi.string().required()
}).unknown();
