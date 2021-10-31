import { copyToClipboard } from '../utils/utils';

let shareLinkElement: JQuery;

/**
 * Registers tooltip for the game link
 */
export function registerGameLinkHandlers(): void {

    // Get game link element using JQuery and enable tooltip
    shareLinkElement = $('#game-link');
    (shareLinkElement as any).tooltip();

    // Register game link event handlers
    shareLinkElement.on('click', onGameLinkClick);
    shareLinkElement.on('hidden.bs.tooltip', onGameLinkToolTipHidden);
}

/**
 * Called when game link is clicked
 */
function onGameLinkClick(): void {

    // Get share link text
    const shareLinkText = shareLinkElement.html();

    // Copy link to clipboard
    copyToClipboard(shareLinkText);

    // Update tooltip to show 'Copied to clipboard!'
    shareLinkElement.attr('data-bs-original-title', 'Copied to clipboard!');
    (shareLinkElement as any).tooltip('show');
}

/**
 * Called when game link tooltip becomes hidden
 */
function onGameLinkToolTipHidden(): void {

    // Set tooltip text back to 'Copy to clipboard'
    shareLinkElement.attr('data-bs-original-title', 'Copy to clipboard');
}