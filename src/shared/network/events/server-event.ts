import type { BoardUpdateEvent }              from './board-update';
import type { IConnectionInfoEvent }          from './i-connection-info';
import type { IEnterSetupFailureEvent }       from './i-enter-setup-failure';
import type { IEnteringSetupEvent }           from './i-entering-setup';
import type { IGameInfoEvent }                from './i-game-info';
import type { IGameOverEvent }                from './i-game-over';
import type { IGameStartEvent }               from './i-game-start';
import type { IGameTerminatedEvent }          from './i-game-terminated';
import type { IMessageEvent }                 from './i-message';
import type { IPlayerAttributeUpdateEvent }   from './i-player-attribute-update';
import type { IPlayerJoinEvent }              from './i-player-join';
import type { IPlayerLeaveEvent }             from './i-player-leave';
import type { IPlayerLostEvent }              from './i-player-lost';
import type { IPlayerReadyEvent }             from './i-player-ready';
import type { IPlayerTeamAssignmentEvent }    from './i-player-team-assignment';
import type { IPlayerTimedOutEvent }          from './i-player-timed-out';
import type { IScenarioAttributeUpdateEvent } from './i-scenario-attribute-update';
import type { ISetupInfoEvent }               from './i-setup-info';
import type { IShipAbilityUpdate }            from './i-ship-ability-update';
import type { IShipAppearEvent }              from './i-ship-appear';
import type { IShipAttributeUpdate }          from './i-ship-attribute-update';
import type { IShipDestroyedEvent }           from './i-ship-destroyed';
import type { IShipDisappearEvent }           from './i-ship-disappear';
import type { IShipMoveEvent }                from './i-ship-move';
import type { IShipRotateEvent }              from './i-ship-rotate';
import type { ITeamAttributeUpdate }          from './i-team-attribute-update';
import type { ITurnAdvancementEvent }         from './i-turn-advancement';

/**
 * Base server event which all server events extend
 */
export interface IBaseServerEvent {
    event: ServerEventID;
}

/**
 * Type matching any server event
 */
export type ServerEvent =
    BoardUpdateEvent |
    IConnectionInfoEvent |
    IEnterSetupFailureEvent |
    IEnteringSetupEvent |
    IGameInfoEvent |
    IGameOverEvent |
    IGameStartEvent |
    IGameTerminatedEvent |
    IPlayerAttributeUpdateEvent |
    IPlayerJoinEvent |
    IPlayerLeaveEvent |
    IPlayerLostEvent |
    IPlayerReadyEvent |
    IPlayerTeamAssignmentEvent |
    IPlayerTimedOutEvent |
    IScenarioAttributeUpdateEvent |
    ISetupInfoEvent |
    IShipAbilityUpdate |
    IShipAppearEvent |
    IShipAttributeUpdate |
    IShipDestroyedEvent |
    IShipDisappearEvent |
    IShipMoveEvent |
    IShipRotateEvent |
    ITeamAttributeUpdate |
    ITurnAdvancementEvent |
    IMessageEvent;

/**
 * Intermediate variable to trick Typescript
 */
let x: ServerEvent;

/**
 * Type matching all event name strings
 */
export type ServerEventID = typeof x.event;
