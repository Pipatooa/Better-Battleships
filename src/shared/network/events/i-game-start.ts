import { IBoardInfo } from '../scenario/i-board-info';
import { IPlayerInfo } from '../scenario/i-player-info';
import { IBaseServerEvent } from './i-server-event';

export interface IGameStartEvent extends IBaseServerEvent {
    event: 'gameStart',
    boardInfo: IBoardInfo,
    playerInfo: IPlayerInfo
}