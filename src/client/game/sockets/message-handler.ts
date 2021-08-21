import {MessageEvent} from 'isomorphic-ws';
import {IServerEvent, ServerEventID} from '../../../shared/network/events/i-server-event';
import {handleConnectionInfo} from './event-handlers/connection-info';
import {handleGameInfo} from './event-handlers/game-info';
import {handleGameStart} from './event-handlers/game-start';
import {handlePlayerJoin} from './event-handlers/player-join';
import {handlePlayerLeave} from './event-handlers/player-leave';
import {handlePlayerReady} from './event-handlers/player-ready';
import {handleTeamAssignment} from './event-handlers/team-assignment';

export function handleMessage(e: MessageEvent) {
    let serverEvent = JSON.parse(e.data.toString()) as IServerEvent;
    let handlerFunction = handlers[serverEvent.event];
    handlerFunction(serverEvent);
}

const handlers: Record<ServerEventID, (event: any) => void> = {
    connectionInfo: handleConnectionInfo,
    gameInfo: handleGameInfo,
    playerJoin: handlePlayerJoin,
    playerLeave: handlePlayerLeave,
    teamAssignment: handleTeamAssignment,
    playerReady: handlePlayerReady,
    gameStart: handleGameStart
}
