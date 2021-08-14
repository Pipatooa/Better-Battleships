import {Data} from 'isomorphic-ws';
import Joi from 'joi';
import {Client} from './client';
import {baseRequestSchema, IRequest, RequestID} from './i-request';
import {handleJoinRequest, joinRequestSchema} from './request-handlers/join-request-handler';

export async function handleMessage(client: Client, msg: Data) {

    let request: IRequest;

    try {
        request = await JSON.parse(msg.toString());
    } catch (e) {
        if (e instanceof SyntaxError) {
            client.ws.close(1003, 'Invalid JSON data');
            return;
        }
        throw e;
    }

    // Check request against schema
    try {
        request = await baseRequestSchema.validateAsync(request);

        let [schema, handlerFunction] = requestInformation[request.request];
        request = await schema.validateAsync(request);

        // Parse message in handler function
        handlerFunction(client, request);

    } catch (e) {
        if (e instanceof Joi.ValidationError) {
            client.ws.close(1002, e.message);
            return;
        }
        throw e;
    }
}

export const requestInformation: Record<RequestID, [Joi.Schema, (client: Client, request: IRequest) => void]> = {
    join: [joinRequestSchema, handleJoinRequest]
};
