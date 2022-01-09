import { Message }            from 'client/game/ui/message';
import type { IMessageEvent } from '../../../../shared/network/events/i-message';

/**
 * Handles a message event from the server
 *
 * @param  messageEvent Event object to handle
 */
export function handleMessageEvent(messageEvent: IMessageEvent): void {
    if (messageEvent.display === 'message')
        new Message(messageEvent.message);
}
