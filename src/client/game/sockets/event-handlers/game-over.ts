import { game }                from '../../game';
import { Popup }               from '../../ui/popups/popup';
import type { IGameOverEvent } from 'shared/network/events/i-game-over';

/**
 * Handles a game over event from the server
 *
 * @param  gameOverEvent Event object to handle
 */
export function handleGameOver(gameOverEvent: IGameOverEvent): void {

    const team = game.teams[gameOverEvent.winningTeam];

    // Display win message to client
    new Popup(`${team.descriptor.name} wins!`, gameOverEvent.message, false, 'Return to Home Page', (): boolean => {
        window.location.href = `/${window.location.search}`;
        return false;
    });
}
