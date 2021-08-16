import {IDescriptorInfo} from './i-descriptor-info';
import {ITeamInfo} from './i-team-info';

export interface IScenarioInfo {
    descriptor: IDescriptorInfo;
    teams: { [name: string]: ITeamInfo };
}