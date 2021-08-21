import {sendRequest} from './opener';

export function joinTeam(team: string) {
    sendRequest({
        request: 'joinTeam',
        team: team
    });
}

export function ready(ready: boolean) {
    sendRequest({
        request: 'ready',
        value: ready
    })
}