import { Message }            from 'client/game/ui/message';
import { Popup }              from '../../ui/popups/popup';
import type { IMessageEvent } from 'shared/network/events/i-message';

/**
 * Handles a message event from the server
 *
 * @param  messageEvent Event object to handle
 */
export function handleMessage(messageEvent: IMessageEvent): void {
    if (messageEvent.display === 'message')
        new Message(messageEvent.message);
    else {
        const lines = messageEvent.message.split('\n');
        const title = lines[0];
        const message = lines.splice(1).join('\n');
        new Popup(title, message, false);
    }
}
