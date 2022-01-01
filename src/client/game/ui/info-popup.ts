import { VariableVisibilityElement } from './variable-visibility-element';

const infoPopupElement = new VariableVisibilityElement($('#info-popup'));
const infoPopupTitleElement = $('#info-popup-title');
const infoPopupContentElement = $('#info-popup-content');

/**
 * Registers event listeners for info popup buttons
 */
export function registerInfoPopupHandlers(): void {
    $('#info-popup-open-button').on('click', () => infoPopupElement.setVisibility(true));
    $('#info-popup-close-button').on('click', () => infoPopupElement.setVisibility(false));
}

/**
 * Updates the contents of the info popup
 *
 * @param  title   Title for popup window
 * @param  content Content for popup window. Line breaks will be converted to paragraphs.
 * @param  show    Whether to show the popup window
 */
export function setInfoPopupContent(title: string, content: string, show: boolean): void {

    infoPopupTitleElement.text(title);

    infoPopupContentElement.children().remove();
    for (const line of content.split('\n'))
        infoPopupContentElement.append($('<p></p>').text(line));
    
    if (show)
        infoPopupElement.setVisibility(true);
}
