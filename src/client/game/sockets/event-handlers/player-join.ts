import { allPlayers, Player }    from '../../player';
import { Message }               from '../../ui/message';
import type { IPlayerJoinEvent } from 'shared/network/events/i-player-join';

/**
 * Handles a player join event from the server
 *
 * @param  playerJoin Event object to handle
 */
export function handlePlayerJoin(playerJoin: IPlayerJoinEvent): void {
    if (!playerJoin.reconnection) {
        new Player(playerJoin.player, false);
        return;
    }

    const player = allPlayers[playerJoin.player];
    new Message(`${player.name} has reconnected.`);
}
