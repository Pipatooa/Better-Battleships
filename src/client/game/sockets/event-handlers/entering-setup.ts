import { TimeoutManager }           from 'shared/timeout-manager';
import type { IEnteringSetupEvent } from 'shared/network/events/i-entering-setup';

let statusTextElement: JQuery;
let gameStartTime: number;

/**
 * Timeout manager for game countdown
 */
export const gameCountdownManager = new TimeoutManager({
    gameCountdownUpdate: [ updateGameStartCountdown, 50, true ]
});


/**
 * Handles an entering setup event from the server
 *
 * @param  enteringSetupEvent Event object to handle
 */
export function handleEnteringSetup(enteringSetupEvent: IEnteringSetupEvent): void {
    statusTextElement = $('#lobby-status-text');
    gameStartTime = Date.now() + enteringSetupEvent.waitDuration;
    gameCountdownManager.startTimeout('gameCountdownUpdate');
}

/**
 * Updates the status text to indicate the number of seconds remaining until the game starts
 */
function updateGameStartCountdown(): void {
    const delta = (gameStartTime - Date.now()) / 1000;

    // If delta time is 0 or negative, stop game countdown update interval timeout
    if (delta <= 0) {
        statusTextElement.text('Starting game in 0.0s...');
        gameCountdownManager.stopTimeout('gameCountdownUpdate');
        return;
    }

    statusTextElement.text(`Starting game in ${delta.toFixed(1)}s...`);
}
