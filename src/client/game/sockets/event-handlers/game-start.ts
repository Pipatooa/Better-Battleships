import { IGameStartEvent } from '../../../../shared/network/events/i-game-start';

/**
 * Handles a game start event from the server
 *
 * @param  gameStartEvent Event object to handle
 */
export function handleGameStart(gameStartEvent: IGameStartEvent): void {

    // Change info pane visibility
    $('#info-pane').removeClass('d-none');
    $('#ship-selection-pane').addClass('d-none');

}