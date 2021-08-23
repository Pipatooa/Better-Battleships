import {IBaseServerEvent} from './i-server-event';

export interface IGameStartEvent extends IBaseServerEvent {
    event: 'gameStart'
}