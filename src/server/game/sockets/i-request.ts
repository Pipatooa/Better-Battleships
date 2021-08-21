import Joi from 'joi';
import {IJoinTeamRequest} from './request-handlers/join-team';
import {IReadyRequest} from './request-handlers/ready';

export interface IBaseRequest {
    request: RequestID;
}

export type IRequest =
    IJoinTeamRequest |
    IReadyRequest;

export const requestIDs = [
    'joinTeam',
    'ready'
] as const;

export type RequestID = typeof requestIDs[number];

export const baseRequestSchema = Joi.object({
    request: Joi.valid(...requestIDs).required()
}).unknown();
