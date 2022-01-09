import Joi                       from 'joi';
import { baseRequestSchema }     from 'shared/network/requests/i-client-request';
import { GamePhase }             from '../../game';
import type { Team }             from '../../scenario/objects/team';
import type { Client }           from '../client';
import type { IJoinTeamRequest } from 'shared/network/requests/i-join-team';

/**
 * Handles a join team request from the client
 *
 * @param  client          Client that made the request
 * @param  joinTeamRequest Request object to handle
 */
export async function handleJoinTeamRequest(client: Client, joinTeamRequest: IJoinTeamRequest): Promise<void> {

    // If client is ready, do not allow them to switch teams, ignoring request
    // Ignore request if the game has already started
    if (client.ready || client.game.gamePhase !== GamePhase.Lobby)
        return;

    // Try to get team from game using team ID supplied
    const team: Team | undefined = client.game.scenario.teams[joinTeamRequest.team];

    // If no team was found that matched the ID provided
    if (team === undefined) {
        client.ws.close(1002, 'Team does not exist');
        return;
    }

    // Add client to team
    client.team = team;

    // Broadcast team assignment to existing clients
    for (const existingClient of client.game.clients) {
        existingClient.sendEvent({
            event: 'playerTeamAssignment',
            player: client.identity,
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
