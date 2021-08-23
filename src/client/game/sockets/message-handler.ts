import {MessageEvent} from 'isomorphic-ws';
import {IServerEvent, ServerEventID} from '../../../shared/network/events/i-server-event';
import {handleConnectionInfo} from './event-handlers/connection-info';
import {handleGameInfo} from './event-handlers/game-info';
import {handleGameStart} from './event-handlers/game-start';
import {handleGameStarting} from './event-handlers/game-starting';
import {handleGameStartFailure} from './event-handlers/game-start-failure';
import {handlePlayerJoin} from './event-handlers/player-join';
import {handlePlayerLeave} from './event-handlers/player-leave';
import {handlePlayerReady} from './event-handlers/player-ready';
import {handleTeamAssignment} from './event-handlers/team-assignment';

/**
 * Handles an event from the server
 * @param e Message event
 */
export function handleMessage(e: MessageEvent) {

    // Unpack JSON request data
    let serverEvent = JSON.parse(e.data.toString()) as IServerEvent;

    // Fetch handler based on event type
    let handlerFunction = handlers[serverEvent.event];

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
    gameStartFailure: handleGameStartFailure,
    gameStarting: handleGameStarting,
    gameStart: handleGameStart
};
