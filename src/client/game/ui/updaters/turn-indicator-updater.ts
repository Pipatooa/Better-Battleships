import { TimeoutManager }  from 'shared/timeout-manager';
import { allPlayers }      from '../../player';
import { selfIdentity }    from '../../sockets/event-handlers/connection-info';
import { sendRequest }     from '../../sockets/opener';
import { SidebarElements } from '../element-cache';
import type { Player }     from '../../player';

export let currentPlayerTurn: Player;
export let ourTurn = false;

let turnStartTime = 0;
let maxTurnTime: number;
const turnTimeoutManager = new TimeoutManager({
    'updateTurnTimer': [updateTurnTimer, 1000, true]
});

/**
 * Sets up correct elements for the turn indicator
 *
 * @param  identities     Array of player identity strings
 * @param  turnStartIndex Starting index for turns to start from
 * @param  turnLength     Maximum turn length in seconds
 */
export function setupTurnIndicator(identities: string[], turnStartIndex: number, turnLength: number): void {

    // Construct turn indicator elements
    for (let i = 0; i < identities.length; i++){
        const identity = identities[i];
        const player = allPlayers[identity];
        player.createTurnIndicatorElement();

        if (i === turnStartIndex) {
            player.turnIndicatorElement!.addClass('turn-indicator-active');
            currentPlayerTurn = player;
        }
    }

    // Register event listeners
    SidebarElements.turnButton.get(0)!.addEventListener('click', () => sendRequest({
        request: 'endTurn'
    }));

    maxTurnTime = turnLength;
}

/**
 * Starts or restarts the current turn timer
 */
export function startTurnTimer(): void {
    turnTimeoutManager.startTimeout('updateTurnTimer');
    turnStartTime = Date.now();
    SidebarElements.turnCountdownSection.setVisibility(true);
    updateTurnButton();
    updateTurnTimer();
}

/**
 * Updates the time remaining on the turn timer
 */
export function updateTurnTimer(): void {
    const timeDelta = Date.now() - turnStartTime;
    const timeLeft = maxTurnTime - Math.floor(timeDelta / 1000);
    const seconds = timeLeft % 60;
    const minutes = Math.floor(timeLeft / 60);
    SidebarElements.turnCountdown.text(`${minutes}:${seconds.toString().padStart(2, '0')}`);
}

/**
 * Updates the text within the turn button
 */
export function updateTurnButton(): void {
    ourTurn = currentPlayerTurn.identity === selfIdentity;
    SidebarElements.turnButton.attr('disabled', !ourTurn as any);
    SidebarElements.turnText.text(ourTurn ? 'End Turn' : `Waiting for ${currentPlayerTurn.name}`);
}

/**
 * Advances the current player's turn on the turn indicator
 *
 * @param  player Player which the turn has passed to
 */
export function advanceTurnIndicator(player: Player): void {
    currentPlayerTurn.turnIndicatorElement!.removeClass('turn-indicator-active');
    player.turnIndicatorElement!.addClass('turn-indicator-active');
    currentPlayerTurn = player;
    startTurnTimer();
}
