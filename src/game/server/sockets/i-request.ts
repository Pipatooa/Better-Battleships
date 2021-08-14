import Joi from 'joi';
import {IJoinRequest} from './request-handlers/join-request-handler';

export interface IBaseRequest {
    request: RequestID;
}

export type IRequest =
    IJoinRequest

export const requestIDs = [
    'join'
] as const;

export type RequestID = typeof requestIDs[number];

export const baseRequestSchema = Joi.object({
    request: Joi.valid(...requestIDs).required()
}).unknown();
