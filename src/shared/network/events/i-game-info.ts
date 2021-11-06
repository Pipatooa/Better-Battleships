import type { IScenarioInfo } from '../scenario/i-scenario-info';
import type { IBaseServerEvent } from './i-server-event';

/**
 * Event sent to the client when they join the game lobby
 */
export interface IGameInfoEvent extends IBaseServerEvent {
    event: 'gameInfo',
    scenario: IScenarioInfo,
    playerInfo: { [id: string]: [string, boolean] | [null, false] }
}
