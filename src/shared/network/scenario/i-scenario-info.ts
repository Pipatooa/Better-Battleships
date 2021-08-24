import {IDescriptorInfo} from './i-descriptor-info';
import {ITeamInfo} from './i-team-info';

/**
 * Portable network version of Scenario object
 */
export interface IScenarioInfo {
    author: string;
    descriptor: IDescriptorInfo;
    teams: { [name: string]: ITeamInfo };
}