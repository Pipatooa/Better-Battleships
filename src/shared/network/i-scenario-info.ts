import {IDescriptorInfo} from './i-descriptor-info';
import {ITeamInfo} from './i-team-info';

export interface IScenarioInfo {
    author: string;
    descriptor: IDescriptorInfo;
    teams: { [name: string]: ITeamInfo };
}