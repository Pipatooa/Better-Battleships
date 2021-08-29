import { IBaseServerEvent } from './i-server-event';

export interface IGameStartFailureEvent extends IBaseServerEvent {
    event: 'gameStartFailure',
    reason: string
}