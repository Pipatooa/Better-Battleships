import { IConnectionInfoEvent } from './i-connection-info';
import { IGameInfoEvent } from './i-game-info';
import { IGameStartEvent } from './i-game-start';
import { ISetupInfoEvent } from './i-setup-info';
import { IEnterSetupFailureEvent } from './i-enter-setup-failure';
import { IEnteringSetupEvent } from './i-entering-setup';
import { IPlayerJoinEvent } from './i-player-join';
import { IPlayerLeaveEvent } from './i-player-leave';
import { IPlayerReadyEvent } from './i-player-ready';
import { ITeamAssignmentEvent } from './i-team-assignment';

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
    IEnterSetupFailureEvent |
    IEnteringSetupEvent |
    ISetupInfoEvent |
    IGameStartEvent;


/**
 * Intermediate variable to trick Typescript
 */
let x: IServerEvent;
/**
 * Type matching all event name strings
 */
export type ServerEventID = typeof x.event;
