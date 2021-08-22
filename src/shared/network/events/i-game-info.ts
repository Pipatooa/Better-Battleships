import {IScenarioInfo} from '../i-scenario-info';
import {IBaseServerEvent} from './i-server-event';

/**
 * Game info event sent to the client when they join the game lobby
 */
export interface IGameInfoEvent extends IBaseServerEvent {
    event: 'gameInfo',
    scenario: IScenarioInfo
}