let shareLinkElement: JQuery;

/**
 * Registers tooltip for the share link
 */
export function registerShareLinkHandlers() {

    // Get share link element using JQuery and enable tooltip
    shareLinkElement = $('#share-link');
    (shareLinkElement as any).tooltip();

    // Register share link event handlers
    shareLinkElement.on('click', onShareLinkClick);
    shareLinkElement.on('hidden.bs.tooltip', onShareLinkToolTipHidden);
}

/**
 * When share link is clicked
 */
function onShareLinkClick() {

    // Create temporary input element and add it to the document
    let temp = $('<input>');
    $('body').append(temp);

    // Get share link text
    let shareLinkText = shareLinkElement.html();

    // Set value of temporary input to share link and select it
    temp.val(shareLinkText).select();

    // Copy currently selected text
    document.execCommand('copy');

    // Remove temporary element
    temp.remove();

    // Update tooltip to show 'Copied to clipboard!'
    shareLinkElement.attr('data-bs-original-title', 'Copied to clipboard!');
    (shareLinkElement as any).tooltip('show');
}

/**
 * When share link tooltip becomes hidden
 */
function onShareLinkToolTipHidden() {

    // Set tooltip text back to 'Copy to clipboard'
    shareLinkElement.attr('data-bs-original-title', 'Copy to clipboard');
}