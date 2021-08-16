import {MessageEvent} from 'isomorphic-ws';
import {IGameInfo} from '../../../shared/network/i-game-info';
import {IPlayerJoin} from '../network/i-player-join';
import {IPlayerLeave} from '../network/i-player-leave';
import {IServerMessage} from '../network/i-server-message';
import {ITeamAssignment} from '../network/i-team-assignment';
import {handleGameInfoMessage} from './message-handlers/game-info';
import {handlePlayerJoin} from './message-handlers/player-join';
import {handlePlayerLeave} from './message-handlers/player-leave';
import {handleTeamAssignment} from './message-handlers/team-assignment';

export function handleMessage(e: MessageEvent) {
    let serverMessage = JSON.parse(e.data.toString()) as IServerMessage;

    switch (serverMessage.dataType) {
        case 'gameInfo':
            handleGameInfoMessage(serverMessage as unknown as IGameInfo);
            return;
        case 'playerJoin':
            handlePlayerJoin(serverMessage as unknown as IPlayerJoin);
            return;
        case 'teamAssignment':
            handleTeamAssignment(serverMessage as unknown as ITeamAssignment);
            return;
        case 'playerLeave':
            handlePlayerLeave(serverMessage as unknown as IPlayerLeave);
            return;
    }

    console.log(`Unknown data type '${serverMessage.dataType}'`);
}