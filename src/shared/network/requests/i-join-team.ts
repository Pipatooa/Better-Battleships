import type { IBaseClientRequest } from './i-client-request';

/**
 * Request sent when client wants to join a team
 */
export interface IJoinTeamRequest extends IBaseClientRequest {
    request: 'joinTeam',
    team: string
}
