import {socket} from './opener';

export function joinTeam(team: string) {
    socket.send(JSON.stringify({
        request: 'joinTeam',
        team: team
    }));
}