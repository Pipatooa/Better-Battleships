import { Player }                from '../../player';
import { handlePlayerReady }     from './player-ready';
import type { IPlayerJoinEvent } from 'shared/network/events/i-player-join';

/**
 * Handles a player join event from the server
 *
 * @param  playerJoin Event object to handle
 */
export function handlePlayerJoin(playerJoin: IPlayerJoinEvent): void {

    // Create a new player using the player's identity
    new Player(playerJoin.player, false);

    // Pass player readiness onto player ready handler
    handlePlayerReady({
        event: 'playerReady',
        player: playerJoin.player,
        ready: playerJoin.ready
    });
}
