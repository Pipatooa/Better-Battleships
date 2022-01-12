import { allPlayers, selfPlayer }     from '../../player';
import { Message }                    from '../../ui/message';
import { advanceTurnIndicator }       from '../../ui/updaters/turn-indicator-updater';
import type { ITurnAdvancementEvent } from 'shared/network/events/i-turn-advancement';

/**
 * Handles a turn advancement event from the server
 *
 * @param  turnAdvancement Event object to handle
 */
export function handleTurnAdvancement(turnAdvancement: ITurnAdvancementEvent): void {
    const player = allPlayers[turnAdvancement.player];
    advanceTurnIndicator(player);

    // Display update messages to player
    if (player === selfPlayer)
        new Message("It's your turn!");
    else
        new Message(`Turn passed to ${player.name}.`);
}
