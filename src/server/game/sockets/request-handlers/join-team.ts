import Joi from 'joi';
import { baseRequestSchema } from '../../../../shared/network/requests/i-client-request';
import { IJoinTeamRequest } from '../../../../shared/network/requests/i-join-team';
import { GamePhase } from '../../game';
import { Team } from '../../scenario/team';
import { Client } from '../client';

/**
 * Handles a join team request from the client
 *
 * @param  client          Client that made the request
 * @param  joinTeamRequest Request object to handle
 */
export function handleJoinTeamRequest(client: Client, joinTeamRequest: IJoinTeamRequest): void {

    // If client is ready, do not allow them to switch teams, ignoring request
    // Ignore request if the game has already started
    if (client.ready || client.game.gamePhase !== GamePhase.Lobby)
        return;

    // Try to get team from game using team ID supplied
    const team: Team | undefined = client.game.scenario.teams[joinTeamRequest.team];

    // If no team was found that matched the ID provided
    if (team === undefined) {
        client.ws.close(1013, 'Team does not exist');
        return;
    }

    // Add client to team
    client.team = team;

    // Broadcast team assignment to existing clients
    for (const existingClient of client.game.clients) {
        existingClient.sendEvent({
            event: 'teamAssignment',
            playerIdentity: client.identity,
            team: joinTeamRequest.team
        });
    }

    // Attempt to enter the setup phase of the game
    client.game.attemptGameSetup();
}

/**
 * Schema for validating request JSON
 */
export const joinTeamRequestSchema = baseRequestSchema.keys({
    request: 'joinTeam',
    team: Joi.string().required()
});