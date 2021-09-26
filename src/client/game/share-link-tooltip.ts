import { flags } from '../game';
import { copyToClipboard } from '../utils/utils';

let shareLinkElement: JQuery;

/**
 * Registers tooltip for the share link
 */
export function registerShareLinkHandlers(): void {

    // Get share link element using JQuery and enable tooltip
    shareLinkElement = $('#share-link');
    (shareLinkElement as any).tooltip();

    // Register share link event handlers
    shareLinkElement.on('click', onShareLinkClick);
    shareLinkElement.on('hidden.bs.tooltip', onShareLinkToolTipHidden);
}

/**
 * Called when share link is clicked
 */
function onShareLinkClick(): void {

    // Get share link text
    const shareLinkText = shareLinkElement.html();

    // Copy link to clipboard
    copyToClipboard(shareLinkText);

    // Update tooltip to show 'Copied to clipboard!'
    shareLinkElement.attr('data-bs-original-title', 'Copied to clipboard!');
    (shareLinkElement as any).tooltip('show');
}

/**
 * Called when share link tooltip becomes hidden
 */
function onShareLinkToolTipHidden(): void {

    // Set tooltip text back to 'Copy to clipboard'
    shareLinkElement.attr('data-bs-original-title', 'Copy to clipboard');
}