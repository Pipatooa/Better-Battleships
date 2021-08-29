import { IBaseClientRequest } from './i-client-request';

/**
 * Join team request sent to server when client wants to join a team
 */
export interface IJoinTeamRequest extends IBaseClientRequest {
    request: 'joinTeam',
    team: string
}