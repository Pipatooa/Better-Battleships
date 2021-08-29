import { IDescriptorInfo } from './i-descriptor-info';

/**
 * Portable network version of Team object
 */
export interface ITeamInfo {
    descriptor: IDescriptorInfo,
    maxPlayers: number
}