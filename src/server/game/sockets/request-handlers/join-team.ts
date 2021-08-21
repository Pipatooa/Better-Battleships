import Joi from 'joi';
import {Team} from '../../scenario/team';
import {Client} from '../client';
import {baseRequestSchema, IBaseRequest} from '../i-request';

export function handleJoinTeamRequest(client: Client, joinTeamRequest: IJoinTeamRequest) {

    let team: Team | undefined = client.game?.scenario.teams[joinTeamRequest.team];

    if (team === undefined) {
        client.ws.close(1013, 'Team does not exist');
        return;
    }

    // Add client to team
    client.team = team;

    // Broadcast team assignment to existing clients
    for (let existingClient of client.game?.clients || []) {
        existingClient.ws.send(JSON.stringify({
            dataType: 'teamAssignment',
            playerIdentity: client.identity,
            team: joinTeamRequest.team
        }));
    }
}

export interface IJoinTeamRequest extends IBaseRequest {
    request: 'joinTeam',
    team: string
}

export const joinTeamRequestSchema = baseRequestSchema.keys({
    request: 'joinTeam',
    team: Joi.string().required()
});