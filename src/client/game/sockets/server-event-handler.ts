import { handleConnectionInfo }            from './event-handlers/connection-info';
import { handleEnterSetupFailure }         from './event-handlers/enter-setup-failure';
import { handleEnteringSetup }             from './event-handlers/entering-setup';
import { handleGameInfo }                  from './event-handlers/game-info';
import { handleGameOver }                  from './event-handlers/game-over';
import { handleGameStart }                 from './event-handlers/game-start';
import { handleMessage }                   from './event-handlers/message';
import { handlePlayerAttributeUpdate }     from './event-handlers/player-attribute-update';
import { handlePlayerJoin }                from './event-handlers/player-join';
import { handlePlayerLeave }               from './event-handlers/player-leave';
import { handlePlayerLost }                from './event-handlers/player-lost';
import { handlePlayerReady }               from './event-handlers/player-ready';
import { handleSetupInfo }                 from './event-handlers/setup-info';
import { handleShipAbilityUpdate }         from './event-handlers/ship-ability-update';
import { handleShipAppear }                from './event-handlers/ship-appear';
import { handleShipAttributeUpdate }       from './event-handlers/ship-attribute-update';
import { handleShipDestroyed }             from './event-handlers/ship-destroyed';
import { handleShipDisappear }             from './event-handlers/ship-disappear';
import { handleShipMove }                  from './event-handlers/ship-movement';
import { handleShipRotate }                from './event-handlers/ship-rotate';
import { handlePlayerTeamAssignment }      from './event-handlers/team-assignment';
import { handleTeamAttributeUpdate }       from './event-handlers/team-attribute-update';
import { handleTurnAdvancement }           from './event-handlers/turn-advancement';
import type { MessageEvent }               from 'isomorphic-ws';
import type { ServerEvent, ServerEventID } from 'shared/network/events/server-event';

/**
 * Handles an event from the server
 *
 * @param  e Message event
 */
export function handleServerEvent(e: MessageEvent): void {

    // Unpack JSON request data
    const serverEvent = JSON.parse(e.data.toString()) as ServerEvent;

    // Fetch handler based on event type
    const handlerFunction = handlers[serverEvent.event];

    // If server sent an unknown event
    if (handlerFunction === undefined) {
        console.log(`Unknown server event ${serverEvent}`);
        return;
    }

    // Parse event in handler function
    handlerFunction(serverEvent);
}

/**
 * Record of handler functions for server events
 *
 * Typescript record type enforces an entry for each event id
 */
const handlers: Record<ServerEventID, (event: any) => void> = {
    connectionInfo: handleConnectionInfo,
    enterSetupFailure: handleEnterSetupFailure,
    enteringSetup: handleEnteringSetup,
    gameInfo: handleGameInfo,
    gameOver: handleGameOver,
    gameStart: handleGameStart,
    playerAttributeUpdate: handlePlayerAttributeUpdate,
    playerJoin: handlePlayerJoin,
    playerLeave: handlePlayerLeave,
    playerLost: handlePlayerLost,
    playerReady: handlePlayerReady,
    playerTeamAssignment: handlePlayerTeamAssignment,
    setupInfo: handleSetupInfo,
    shipAbilityUpdate: handleShipAbilityUpdate,
    shipAppear: handleShipAppear,
    shipAttributeUpdate: handleShipAttributeUpdate,
    shipDestroyed: handleShipDestroyed,
    shipDisappear: handleShipDisappear,
    shipMove: handleShipMove,
    shipRotate: handleShipRotate,
    teamAttributeUpdate: handleTeamAttributeUpdate,
    turnAdvancement: handleTurnAdvancement,
    message: handleMessage
};
