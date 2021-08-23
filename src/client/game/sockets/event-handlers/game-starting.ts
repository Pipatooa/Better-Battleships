import {IGameStartingEvent} from '../../../../shared/network/events/i-game-starting';
import {TimeoutManager} from '../../../../shared/timeout-manager';

let statusTextElement: JQuery;
let gameStartTime: number;

/**
 * Timeout manager for game countdown
 */
export let gameCountdownManager = new TimeoutManager({
    gameCountdownUpdate: [updateGameStartCountdown, 50, true]
});


/**
 * Handles a game starting event from the server
 * @param gameStartingEvent Event object to handle
 */
export function handleGameStarting(gameStartingEvent: IGameStartingEvent) {

    // Cache status text element
    statusTextElement = $('#status-text');

    // Calculate game end time from wait duration provided
    gameStartTime = Date.now() + gameStartingEvent.waitDuration;

    // Start interval timer
    gameCountdownManager.startTimeout('gameCountdownUpdate');
}

/**
 * Updates the status text to indicate the number of seconds remaining until the game starts
 */
function updateGameStartCountdown() {

    // Calculate time delta in seconds between now and game start
    let delta = (gameStartTime - Date.now()) / 1000;

    // If delta time is 0 or negative, stop game countdown update interval timeout
    if (delta <= 0) {
        statusTextElement.text('Starting game in 0.0s');
        gameCountdownManager.stopTimeout('gameCountdownUpdate');
        return;
    }

    statusTextElement.text(`Starting game in ${delta.toFixed(1)}s`);
}