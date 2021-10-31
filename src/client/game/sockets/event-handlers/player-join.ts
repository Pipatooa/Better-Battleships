import { IPlayerJoinEvent } from '../../../../shared/network/events/i-player-join';
import { Player } from '../../player';
import { handlePlayerReady } from './player-ready';

/**
 * Handles a player join event from the server
 *
 * @param  playerJoin Event object to handle
 */
export function handlePlayerJoin(playerJoin: IPlayerJoinEvent): void {

    // Create a new player using the player's identity
    new Player(playerJoin.playerIdentity, false);

    // Pass player readiness onto player ready handler
    handlePlayerReady({
        event: 'playerReady',
        playerIdentity: playerJoin.playerIdentity,
        ready: playerJoin.ready
    });
}