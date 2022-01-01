import type { IAttributeUpdateEvent } from './i-attribute-update';
import type { IPlayerUpdateEvent }    from './i-player-update';

/**
 * Event sent when the attributes on a player change
 */
export interface IPlayerAttributeUpdateEvent extends IPlayerUpdateEvent, IAttributeUpdateEvent {
    event: 'playerAttributeUpdate'
}
