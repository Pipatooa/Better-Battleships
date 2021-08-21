import {IGameInfo} from '../../../shared/network/i-game-info';
import {handleConnectionInfo, IConnectionInfo} from './message-handlers/connection-info';
import {handleGameInfoMessage} from './message-handlers/game-info';
import {handlePlayerJoin, IPlayerJoin} from './message-handlers/player-join';
import {handlePlayerLeave, IPlayerLeave} from './message-handlers/player-leave';
import {handlePlayerReady, IPlayerReady} from './message-handlers/player-ready';
import {handleTeamAssignment, ITeamAssignment} from './message-handlers/team-assignment';

export function handleMessage(e: MessageEvent) {
    let serverMessage = JSON.parse(e.data.toString()) as IServerMessage;

    switch (serverMessage.dataType) {
        case 'connectionInfo':
            handleConnectionInfo(serverMessage as unknown as IConnectionInfo)
            return;
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
        case 'playerReady':
            handlePlayerReady(serverMessage as unknown as IPlayerReady);
            return;
    }

    console.log(`Unknown data type '${serverMessage.dataType}'`);
}

export interface IServerMessage {
    dataType: string;
}