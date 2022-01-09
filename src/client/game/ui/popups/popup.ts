import { PopupElements } from '../element-cache';

let popups: Popup[] = [];
let currentPopup: Popup | undefined;

/**
 * Popup - Client Version
 *
 * Object representing a dismissible popup being displayed to the client
 */
export class Popup {
    
    /**
     * Popup constructor
     *
     * @param  title   Title of the popup
     * @param  message Message to display
     * @param  special Whether the message contains raw html
     */
    public constructor(private readonly title: string,
                       private readonly message: string,
                       private readonly special: boolean) {

        // If special, show immediately
        // Currently shown popup will be re-queued unless it is also special
        if (this.special) {
            if (currentPopup !== undefined && !currentPopup.special)
                popups.push(currentPopup);
            this.show();

        // Show popup if none visible
        } else if (currentPopup === undefined)
            this.show();
        else
            popups.unshift(this);
    }

    /**
     * Dismisses the current popup and shows the next one
     */
    private static nextPopup(): void {

        currentPopup = undefined;

        // Show next popup
        const next = popups.pop();
        if (next !== undefined) {
            next.show();
            return;
        }

        // If no next popup, clear popup
        PopupElements.popup.setVisibility(false);
    }

    /**
     * Replaces the contents of the popup window with this popup
     */
    protected show(): void {
        currentPopup = this;
        PopupElements.title.text(this.title);

        // Convert message to readable paragraphs
        PopupElements.content.children().remove();
        if (this.special)
            PopupElements.content.html(this.message);
        else
            for (const line of this.message.split('\n')) {
                const paragraph = $('<p></p>').text(line);
                PopupElements.content.append(paragraph);
            }

        PopupElements.popup.setVisibility(true);
    }

    /**
     * Registers a set of event listeners for popup handling
     */
    public static registerListeners(): void {

        // Esc to dismiss popup
        document.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (ev.key === 'Escape')
                Popup.nextPopup();
        });

        PopupElements.closeButton.on('click', () => Popup.nextPopup());
    }
}
