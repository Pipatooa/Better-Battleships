import { allPlayers }             from '../../player';
import { Message }                from '../../ui/message';
import { reconnectionTimeout }    from './connection-info';
import type { IPlayerLeaveEvent } from 'shared/network/events/i-player-leave';

/**
 * Handles a player leave event from the server
 *
 * @param  playerLeave Event object to handle
 */
export function handlePlayerLeave(playerLeave: IPlayerLeaveEvent): void {
    const player = allPlayers[playerLeave.player];
    if (!playerLeave.temporary) {
        player.deconstruct();
        return;
    }

    const seconds = reconnectionTimeout / 1000;
    new Message(`${player.name} has disconnected. ${seconds} seconds until they are timed out.`);
}
