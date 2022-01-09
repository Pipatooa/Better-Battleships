let messages: Message[] = [];
const messageLimit = 5;

/**
 * Registers a set of listeners for message handling
 */
export function registerMessageListeners(): void {
    // Space to dismiss oldest message
    document.addEventListener('keypress', (ev: KeyboardEvent) => {
        if (ev.key === ' ')
            messages.shift()?.deconstruct();
    });
}

/**
 * Message - Client Version
 *
 * Object representing a dismissible message being displayed to the client
 */
export class Message {

    private static readonly messageContainer = $('#inner-message-container');
    private readonly element: JQuery;

    /**
     * Message constructor
     *
     * @param  message Message content
     */
    public constructor(message: string) {
        this.element = this.createElements(message);
        messages.push(this);

        // Remove old messages if message limit is exceeded
        if (messages.length > messageLimit)
            messages.shift()!.deconstruct();
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        this.element.remove();
        messages = messages.filter(m => m !== this);
    }

    /**
     * Creates a set of elements containing the message for the client to see
     *
     * @param    message Message content
     * @returns          Created message element
     */
    private createElements(message: string): JQuery {

        // Create elements
        const innerMessage = $('<p class="mb-0"></p>').text(message);
        const messageTextElement = $('<div class="py-2 px-3 my-auto me-auto"></div>').append(innerMessage);
        const closeMessageButton = $('<div class="p-2 close-message"><b>×</b></div>');
        const messageElement = $('<div class="d-flex message mb-2 rounded-3"></div>');
        messageElement.append(messageTextElement, closeMessageButton);
        Message.messageContainer.append(messageElement);

        // Register event listeners
        closeMessageButton.on('click', () => this.deconstruct());

        return messageElement;
    }
}
