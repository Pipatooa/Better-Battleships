import type { IBoardInfo } from '../scenario/i-board-info';
import type { IPlayerInfo } from '../scenario/i-player-info';
import type { IBaseServerEvent } from './i-server-event';

export interface ISetupInfoEvent extends IBaseServerEvent {
    event: 'setupInfo',
    boardInfo: IBoardInfo,
    playerInfo: IPlayerInfo,
    playerColors: { [id: string]: [string, string] }
}
