import { handleConnectionInfo }             from './event-handlers/connection-info';
import { handleEnterSetupFailure }          from './event-handlers/enter-setup-failure';
import { handleEnteringSetup }              from './event-handlers/entering-setup';
import { handleGameInfo }                   from './event-handlers/game-info';
import { handleGameStart }                  from './event-handlers/game-start';
import { handlePlayerJoin }                 from './event-handlers/player-join';
import { handlePlayerLeave }                from './event-handlers/player-leave';
import { handlePlayerReady }                from './event-handlers/player-ready';
import { handleSetupInfo }                  from './event-handlers/setup-info';
import { handleTeamAssignment }             from './event-handlers/team-assignment';
import { handleTurnAdvancement }            from './event-handlers/turn-advancement';
import type { MessageEvent }                from 'isomorphic-ws';
import type { IServerEvent, ServerEventID } from 'shared/network/events/i-server-event';

/**
 * Handles an event from the server
 *
 * @param  e Message event
 */
export function handleMessage(e: MessageEvent): void {

    // Unpack JSON request data
    const serverEvent = JSON.parse(e.data.toString()) as IServerEvent;

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
    gameInfo: handleGameInfo,
    playerJoin: handlePlayerJoin,
    playerLeave: handlePlayerLeave,
    teamAssignment: handleTeamAssignment,
    playerReady: handlePlayerReady,
    enterSetupFailure: handleEnterSetupFailure,
    enteringSetup: handleEnteringSetup,
    setupInfo: handleSetupInfo,
    gameStart: handleGameStart,
    turnAdvancement: handleTurnAdvancement
};
