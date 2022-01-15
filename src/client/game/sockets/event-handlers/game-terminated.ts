import { Popup }                     from '../../ui/popups/popup';
import type { IGameTerminatedEvent } from 'shared/network/events/i-game-terminated';

/**
 * Handles a game terminated event from the server
 *
 * @param  gameTerminatedEvent Event object to handle
 */
export function handleGameTerminated(gameTerminatedEvent: IGameTerminatedEvent): void {
    new Popup(`Game Terminated! (${gameTerminatedEvent.reason})`, gameTerminatedEvent.message, false, 'Return to Home Page', (): boolean => {
        window.location.href = `/${window.location.search}`;
        return false;
    });
}
