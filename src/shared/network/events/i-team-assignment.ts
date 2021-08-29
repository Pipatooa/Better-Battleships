import { IBaseServerEvent } from './i-server-event';

/**
 * Team assignment event sent when a player chooses a team to be on
 */
export interface ITeamAssignmentEvent extends IBaseServerEvent {
    event: 'teamAssignment',
    playerIdentity: string,
    team: string
}