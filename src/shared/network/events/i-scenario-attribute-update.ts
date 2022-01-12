import type { IAttributeUpdateEvent } from './i-attribute-update';
import type { IBaseServerEvent }      from './server-event';

/**
 * Event sent when the attributes of the scenario change
 */
export interface IScenarioAttributeUpdateEvent extends IBaseServerEvent, IAttributeUpdateEvent {
    event: 'scenarioAttributeUpdate'
}
