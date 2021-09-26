/**
 * Copies text to the user's clipboard
 *
 * @param  text Text to copy to the clipboard
 */
export function copyToClipboard(text: string): void {

    // Create temporary input element and add it to the document
    const temp = $('<input>');
    $('body').append(temp);

    // Set value of temporary input to share link and select it
    temp.val(text).select();

    // Copy currently selected text
    document.execCommand('copy');

    // Remove temporary element
    temp.remove();

    console.log(text);
}