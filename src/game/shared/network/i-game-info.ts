import {IDescriptorInfo} from './i-descriptor-info';
import {IScenarioInfo} from './i-scenario-info';

export interface IGameInfo {
    dataType: 'gameInfo',
    descriptor: IDescriptorInfo,
    scenario: IScenarioInfo
}