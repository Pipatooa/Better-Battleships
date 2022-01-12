import { game }                               from '../../game';
import type { IScenarioAttributeUpdateEvent } from 'shared/network/events/i-scenario-attribute-update';

/**
 * Handles a scenario attribute update event from the server
 *
 * @param  scenarioAttributeUpdateEvent Event object to handle
 */
export function handleScenarioAttributeUpdate(scenarioAttributeUpdateEvent: IScenarioAttributeUpdateEvent): void {
    game.scenarioAttributes!.updateAttributes(scenarioAttributeUpdateEvent.attributes);
}
