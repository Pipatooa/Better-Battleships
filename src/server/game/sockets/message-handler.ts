import {Data} from 'isomorphic-ws';
import Joi from 'joi';
import {baseRequestSchema, ClientRequestID, IClientRequest} from '../../../shared/network/requests/i-client-request';
import {Client} from './client';
import {handleJoinTeamRequest, joinTeamRequestSchema} from './request-handlers/join-team';
import {handleReadyRequest, readyRequestSchema} from './request-handlers/ready';

/**
 * Handles a request from the client
 * @param client Client that made the request
 * @param msg Request data to handle
 */
export async function handleMessage(client: Client, msg: Data) {

    let request: IClientRequest;

    // Unpack JSON request data
    try {
        request = await JSON.parse(msg.toString());
    } catch (e) {
        if (e instanceof SyntaxError) {
            client.ws.close(1003, 'Invalid JSON data');
            return;
        }
        throw e;
    }

    try {
        // Validate request against base request schema
        request = await baseRequestSchema.validateAsync(request);

        // Fetch schema and handler for request based on request type
        let schemaAndHandler = requestSchemaAndHandlers[request.request];

        // If client sent an unknown request
        if (schemaAndHandler === undefined)
            client.ws.close(1002, `Unknown request '${schemaAndHandler}'`);

        // Unpack schema and handler into separate variables
        let [schema, handlerFunction] = schemaAndHandler;

        // Validate request against specific request schema
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

/**
 * Record of request schemas and handler functions for client requests
 *
 * Typescript record type enforces an entry for each request id
 */
const requestSchemaAndHandlers: Record<ClientRequestID, [Joi.Schema, (client: Client, request: any) => void]> = {
    joinTeam: [joinTeamRequestSchema, handleJoinTeamRequest],
    ready: [readyRequestSchema, handleReadyRequest]
};
