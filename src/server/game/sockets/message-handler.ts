import Joi                                                        from 'joi';
import { baseRequestSchema }                                      from 'shared/network/requests/i-client-request';
import { endTurnRequestSchema, handleEndTurnRequest }             from './request-handlers/end-turn';
import { handleJoinTeamRequest, joinTeamRequestSchema }           from './request-handlers/join-team';
import { handleReadyRequest, readyRequestSchema }                 from './request-handlers/ready';
import { handleShipPlacementRequest, shipPlacementRequestSchema } from './request-handlers/ship-placement';
import { baseUseAbilityRequestSchema, handleUseAbilityRequest }   from './request-handlers/use-ability';
import type { Client }                                            from './client';
import type { Data }                                              from 'isomorphic-ws';
import type { ClientRequestID, IClientRequest }                   from 'shared/network/requests/i-client-request';

/**
 * Handles a request from the client
 *
 * @param  client Client that made the request
 * @param  msg    Request data to handle
 */
export async function handleMessage(client: Client, msg: Data): Promise<void> {

    let request: IClientRequest;

    // Unpack JSON request data
    try {
        request = await JSON.parse(msg.toString());
    } catch (e: unknown) {
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
        const schemaAndHandler = requestSchemaAndHandlers[request.request];

        // If client sent an unknown request
        if (schemaAndHandler === undefined)
            client.ws.close(1002, `Unknown request '${schemaAndHandler}'`);

        // Unpack schema and handler into separate variables
        const [ schema, handlerFunction ] = schemaAndHandler;

        // Validate request against specific request schema
        request = await schema.validateAsync(request);

        // Parse message in handler function
        await handlerFunction(client, request);

    } catch (e: unknown) {
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
const requestSchemaAndHandlers: Record<ClientRequestID, [ Joi.Schema, (client: Client, request: any) => Promise<void> ]> = {
    joinTeam: [ joinTeamRequestSchema, handleJoinTeamRequest ],
    ready: [ readyRequestSchema, handleReadyRequest ],
    shipPlacement: [ shipPlacementRequestSchema, handleShipPlacementRequest ],
    useAbility: [ baseUseAbilityRequestSchema, handleUseAbilityRequest ],
    endTurn: [ endTurnRequestSchema, handleEndTurnRequest ]
};
