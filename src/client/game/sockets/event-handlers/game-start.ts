import type { IGameStartEvent } from '../../../../shared/network/events/i-game-start';

/**
 * Handles a game start event from the server
 *
 * @param  gameStartEvent Event object to handle
 */
export function handleGameStart(gameStartEvent: IGameStartEvent): void {

    // Change info pane visibility
    $('#ship-selection-pane').remove();
    $('#info-pane').removeClass('d-none');
    $('#info-pane-turn-section').removeClass('d-none');

}
