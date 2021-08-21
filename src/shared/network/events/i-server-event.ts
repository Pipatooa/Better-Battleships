import {IConnectionInfoEvent} from './i-connection-info';
import {IGameInfoEvent} from './i-game-info';
import {IGameStartEvent} from './i-game-start';
import {IPlayerJoinEvent} from './i-player-join';
import {IPlayerLeaveEvent} from './i-player-leave';
import {IPlayerReadyEvent} from './i-player-ready';
import {ITeamAssignmentEvent} from './i-team-assignment';

export interface IBaseServerEvent {
    event: ServerEventID
}

export type IServerEvent =
    IConnectionInfoEvent |
    IGameInfoEvent |
    IPlayerJoinEvent |
    IPlayerLeaveEvent |
    ITeamAssignmentEvent |
    IPlayerReadyEvent |
    IGameStartEvent;

let x: IServerEvent;
export type ServerEventID = typeof x.event;
