import { allTeams }                  from '../../team';
import type { ITeamAttributeUpdate } from 'shared/network/events/i-team-attribute-update';

/**
 * Handles a team attribute update event from the server
 *
 * @param  teamAttributeUpdateEvent Event object to handle
 */
export function handleTeamAttributeUpdate(teamAttributeUpdateEvent: ITeamAttributeUpdate): void {
    const team = allTeams[teamAttributeUpdateEvent.team];
    team.attributeCollection!.updateAttributes(teamAttributeUpdateEvent.attributes);
}
