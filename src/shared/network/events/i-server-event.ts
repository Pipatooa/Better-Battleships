import type { IConnectionInfoEvent }    from './i-connection-info';
import type { IEnterSetupFailureEvent } from './i-enter-setup-failure';
import type { IEnteringSetupEvent }     from './i-entering-setup';
import type { IGameInfoEvent }          from './i-game-info';
import type { IGameStartEvent }         from './i-game-start';
import type { IPlayerJoinEvent }        from './i-player-join';
import type { IPlayerLeaveEvent }       from './i-player-leave';
import type { IPlayerReadyEvent }       from './i-player-ready';
import type { ISetupInfoEvent }         from './i-setup-info';
import type { IShipAppearEvent }        from './i-ship-appear';
import type { IShipDisappearEvent }     from './i-ship-disappear';
import type { IShipMoveEvent }          from './i-ship-move';
import type { IShipRotateEvent }        from './i-ship-rotate';
import type { ITeamAssignmentEvent }    from './i-team-assignment';
import type { ITurnAdvancement }        from './i-turn-advancement';

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
    IGameStartEvent |
    IShipAppearEvent |
    IShipDisappearEvent |
    IShipMoveEvent |
    IShipRotateEvent |
    ITurnAdvancement;


/**
 * Intermediate variable to trick Typescript
 */
let x: IServerEvent;

/**
 * Type matching all event name strings
 */
export type ServerEventID = typeof x.event;
