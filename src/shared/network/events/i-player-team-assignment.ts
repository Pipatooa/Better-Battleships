import type { IPlayerUpdateEvent } from './i-player-update';

/**
 * Event sent when a player chooses a team to be on
 */
export interface IPlayerTeamAssignmentEvent extends IPlayerUpdateEvent {
    event: 'playerTeamAssignment',
    team: string
}
