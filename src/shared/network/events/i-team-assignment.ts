import {IBaseServerEvent} from './i-server-event';

export interface ITeamAssignmentEvent extends IBaseServerEvent {
    event: 'teamAssignment',
    playerIdentity: string,
    team: string
}