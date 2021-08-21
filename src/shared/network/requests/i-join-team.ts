import {IBaseClientRequest} from './i-client-request';

export interface IJoinTeamRequest extends IBaseClientRequest {
    request: 'joinTeam',
    team: string
}