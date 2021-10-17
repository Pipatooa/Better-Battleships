import { IScenarioInfo } from '../scenario/i-scenario-info';
import { IBaseServerEvent } from './i-server-event';

/**
 * Event sent to the client when they join the game lobby
 */
export interface IGameInfoEvent extends IBaseServerEvent {
    event: 'gameInfo',
    scenario: IScenarioInfo,
    teamAssignments: { [id: string]: string | null }
}