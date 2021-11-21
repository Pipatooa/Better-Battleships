import { sendRequest } from '../sockets/opener';

/**
 * Registers event handlers for buttons
 */
export function registerMiscButtonHandlers(): void {
    $('#ready-button').on('click', () => ready(true));
}

/**
 * Sends a request to the server to join a particular team
 *
 * @param  team Team ID
 */
export function joinTeam(team: string): void {
    sendRequest({
        request: 'joinTeam',
        team: team
    });

    // Enable ready button
    $('#ready-button').attr('disabled', false as any);
}

/**
 * Sends a request to the server to indicate new ready status
 *
 * @param  ready Whether the player is ready or not
 */
export function ready(ready: boolean): void {
    sendRequest({
        request: 'ready',
        value: ready
    });
}


