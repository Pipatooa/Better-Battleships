import type { AttributeUpdates } from '../scenario/i-attribute-info';
import type { IBaseServerEvent } from './i-server-event';

/**
 * Event sent when the attributes on an object change
 */
export interface IAttributeUpdateEvent extends IBaseServerEvent {
    attributes: AttributeUpdates
}
