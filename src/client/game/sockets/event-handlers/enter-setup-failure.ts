import { gameCountdownManager }         from './entering-setup';
import type { IEnterSetupFailureEvent } from 'shared/network/events/i-enter-setup-failure';

/**
 * Handles a game start failure event from the server
 *
 * @param  enterSetupFailureEvent Event object to handle
 */
export function handleEnterSetupFailure(enterSetupFailureEvent: IEnterSetupFailureEvent): void {

    // Interrupt game start countdown
    gameCountdownManager.stopTimeout('gameCountdownUpdate');

    // Set status from reason provided
    $('#lobby-status-text').text(enterSetupFailureEvent.reason);
}
