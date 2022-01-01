import type { IConnectionInfoEvent }        from './i-connection-info';
import type { IEnterSetupFailureEvent }     from './i-enter-setup-failure';
import type { IEnteringSetupEvent }         from './i-entering-setup';
import type { IGameInfoEvent }              from './i-game-info';
import type { IGameOverEvent }              from './i-game-over';
import type { IGameStartEvent }             from './i-game-start';
import type { IPlayerAttributeUpdateEvent } from './i-player-attribute-update';
import type { IPlayerJoinEvent }            from './i-player-join';
import type { IPlayerLeaveEvent }           from './i-player-leave';
import type { IPlayerLostEvent }            from './i-player-lost';
import type { IPlayerReadyEvent }           from './i-player-ready';
import type { IPlayerTeamAssignmentEvent }  from './i-player-team-assignment';
import type { ISetupInfoEvent }             from './i-setup-info';
import type { IShipAbilityUpdate }          from './i-ship-ability-update';
import type { IShipAppearEvent }            from './i-ship-appear';
import type { IShipAttributeUpdate }        from './i-ship-attribute-update';
import type { IShipDestroyedEvent }         from './i-ship-destroyed';
import type { IShipDisappearEvent }         from './i-ship-disappear';
import type { IShipMoveEvent }              from './i-ship-move';
import type { IShipRotateEvent }            from './i-ship-rotate';
import type { ITeamAttributeUpdate }        from './i-team-attribute-update';
import type { ITurnAdvancementEvent }       from './i-turn-advancement';

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
    IEnterSetupFailureEvent |
    IEnteringSetupEvent |
    IGameInfoEvent |
    IGameOverEvent |
    IGameStartEvent |
    IPlayerAttributeUpdateEvent |
    IPlayerJoinEvent |
    IPlayerLeaveEvent |
    IPlayerLostEvent |
    IPlayerReadyEvent |
    IPlayerTeamAssignmentEvent |
    ISetupInfoEvent |
    IShipAbilityUpdate |
    IShipAppearEvent |
    IShipAttributeUpdate |
    IShipDestroyedEvent |
    IShipDisappearEvent |
    IShipMoveEvent |
    IShipRotateEvent |
    ITeamAttributeUpdate |
    ITurnAdvancementEvent;

/**
 * Intermediate variable to trick Typescript
 */
let x: IServerEvent;

/**
 * Type matching all event name strings
 */
export type ServerEventID = typeof x.event;
