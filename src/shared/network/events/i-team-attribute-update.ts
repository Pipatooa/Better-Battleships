import type { IAttributeUpdateEvent } from './i-attribute-update';
import type { IBaseServerEvent }      from './server-event';

/**
 * Event sent when the attributes on a team change
 */
export interface ITeamAttributeUpdate extends IBaseServerEvent, IAttributeUpdateEvent {
    event: 'teamAttributeUpdate',
    team: string
}
