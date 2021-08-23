import {IConnectionInfoEvent} from './i-connection-info';
import {IGameInfoEvent} from './i-game-info';
import {IGameStartEvent} from './i-game-start';
import {IGameStartingEvent} from './i-game-starting';
import {IGameStartFailureEvent} from './i-game-start-failure';
import {IPlayerJoinEvent} from './i-player-join';
import {IPlayerLeaveEvent} from './i-player-leave';
import {IPlayerReadyEvent} from './i-player-ready';
import {ITeamAssignmentEvent} from './i-team-assignment';

/**
 * Base server event which all server events extend
 */
export interface IBaseServerEvent {
    event: ServerEventID;
}

/**
 * Type matching any server event
 */
export type IServerEvent =
    IConnectionInfoEvent |
    IGameInfoEvent |
    IPlayerJoinEvent |
    IPlayerLeaveEvent |
    ITeamAssignmentEvent |
    IPlayerReadyEvent |
    IGameStartFailureEvent |
    IGameStartingEvent |
    IGameStartEvent;


/**
 * Intermediate variable to trick Typescript
 */
let x: IServerEvent;
/**
 * Type matching all event name strings
 */
export type ServerEventID = typeof x.event;
