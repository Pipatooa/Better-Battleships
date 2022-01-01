import { allPlayers }                 from '../../player';
import { advanceTurnIndicator }       from '../../ui/updaters/turn-updater';
import type { ITurnAdvancementEvent } from 'shared/network/events/i-turn-advancement';

/**
 * Handles a turn advancement event from the server
 *
 * @param  turnAdvancement Event object to handle
 */
export function handleTurnAdvancement(turnAdvancement: ITurnAdvancementEvent): void {
    const player = allPlayers[turnAdvancement.player];
    advanceTurnIndicator(player);
}
