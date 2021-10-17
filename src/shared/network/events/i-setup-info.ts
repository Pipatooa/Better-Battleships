import { IBoardInfo } from '../scenario/i-board-info';
import { IPlayerInfo } from '../scenario/i-player-info';
import { IBaseServerEvent } from './i-server-event';

export interface ISetupInfoEvent extends IBaseServerEvent {
    event: 'setupInfo',
    boardInfo: IBoardInfo,
    playerInfo: IPlayerInfo,
    playerColors: { [id: string]: string }
}