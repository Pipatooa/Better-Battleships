import {IBaseServerEvent} from './i-server-event';
import {IScenarioInfo} from '../i-scenario-info';

export interface IGameInfoEvent extends IBaseServerEvent {
    event: 'gameInfo',
    scenario: IScenarioInfo
}