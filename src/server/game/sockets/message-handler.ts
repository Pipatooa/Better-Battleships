import {Data} from 'isomorphic-ws';
import Joi from 'joi';
import {baseRequestSchema, ClientRequestID, IClientRequest} from '../../../shared/network/requests/i-client-request';
import {Client} from './client';
import {handleJoinTeamRequest, joinTeamRequestSchema} from './request-handlers/join-team';
import {handleReadyRequest, readyRequestSchema} from './request-handlers/ready';


export async function handleMessage(client: Client, msg: Data) {

    let request: IClientRequest;

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

        let [schema, handlerFunction] = requestSchemaAndHandlers[request.request];
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

const requestSchemaAndHandlers: Record<ClientRequestID, [Joi.Schema, (client: Client, request: any) => void]> = {
    joinTeam: [joinTeamRequestSchema, handleJoinTeamRequest],
    ready: [readyRequestSchema, handleReadyRequest]
};
