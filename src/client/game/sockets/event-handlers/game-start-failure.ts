import {IGameStartFailureEvent} from '../../../../shared/network/events/i-game-start-failure';
import {gameCountdownManager} from './game-starting';

/**
 * Handles a game start failure event from the server
 * @param gameStartFailure Event object to handle
 */
export function handleGameStartFailure(gameStartFailure: IGameStartFailureEvent) {

    // Interrupt game start countdown
    gameCountdownManager.stopTimeout('gameCountdownUpdate');

    // Set status from reason provided
    $('#status-text').text(gameStartFailure.reason);
}