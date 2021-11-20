import { game } from '../game';
import { sendRequest } from './opener';

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

/**
 * Sends a request to the server with placement info
 */
export function placementDone(): void {

    // Create a list of ship coordinates
    let shipPlacements: [number, number][] = [];
    for (const ship of game.board!.ships)
        shipPlacements.push([ship.x!, ship.y!]);

    // Prevent player from moving their ships once placement is done
    /*gameRenderer.selectedShipRenderer.placementMode = false;*/

    sendRequest({
        request: 'shipPlacement',
        shipPlacements: shipPlacements
    });

    // Update done button to indicate that we are waiting for the other player
    const doneButton: JQuery = $('#button-placement-done');
    doneButton.text('Waiting for other players...');
    doneButton.attr('disabled', true as any);
}
