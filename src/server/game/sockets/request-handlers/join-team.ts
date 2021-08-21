import Joi from 'joi';
import {baseRequestSchema} from '../../../../shared/network/requests/i-client-request';
import {IJoinTeamRequest} from '../../../../shared/network/requests/i-join-team';
import {Team} from '../../scenario/team';
import {Client} from '../client';

export function handleJoinTeamRequest(client: Client, joinTeamRequest: IJoinTeamRequest) {

    // If game has already started, ignore request
    if (client.game.started)
        return;

    let team: Team | undefined = client.game.scenario.teams[joinTeamRequest.team];

    // If no team was found that matched the ID provided
    if (team === undefined) {
        client.ws.close(1013, 'Team does not exist');
        return;
    }

    // Add client to team
    client.team = team;

    // Broadcast team assignment to existing clients
    for (let existingClient of client.game.clients) {
        existingClient.sendEvent({
            event: 'teamAssignment',
            playerIdentity: client.identity,
            team: joinTeamRequest.team
        });
    }
}

export const joinTeamRequestSchema = baseRequestSchema.keys({
    request: 'joinTeam',
    team: Joi.string().required()
});