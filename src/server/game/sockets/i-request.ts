import Joi from 'joi';
import {IJoinRequest} from './request-handlers/join-request';
import {IJoinTeamRequest} from './request-handlers/join-team';

export interface IBaseRequest {
    request: RequestID;
}

export type IRequest =
    IJoinRequest |
    IJoinTeamRequest

export const requestIDs = [
    'join',
    'joinTeam'
] as const;

export type RequestID = typeof requestIDs[number];

export const baseRequestSchema = Joi.object({
    request: Joi.valid(...requestIDs).required()
}).unknown();
