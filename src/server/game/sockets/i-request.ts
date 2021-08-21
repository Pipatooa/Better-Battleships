import Joi from 'joi';
import {IJoinTeamRequest} from './request-handlers/join-team';

export interface IBaseRequest {
    request: RequestID;
}

export type IRequest =
    IJoinTeamRequest;

export const requestIDs = [
    'joinTeam'
] as const;

export type RequestID = typeof requestIDs[number];

export const baseRequestSchema = Joi.object({
    request: Joi.valid(...requestIDs).required()
}).unknown();
