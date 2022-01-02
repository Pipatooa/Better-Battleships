import type { AttributeUpdates }      from '../scenario/i-attribute-info';
import type { IAttributeUpdateEvent } from './i-attribute-update';
import type { IShipUpdateEvent }      from './i-ship-update';

/**
 * Event sent when the attributes on a ship change
 */
export interface IShipAttributeUpdate extends IShipUpdateEvent, IAttributeUpdateEvent {
    event: 'shipAttributeUpdate',
    abilityAttributes: AttributeUpdates[]
}
