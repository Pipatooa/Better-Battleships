import {openSocketConnection} from './sockets/opener';

openSocketConnection();

$(document).ready(() => {
    let shareLinkElement = $('#share-link');

    (shareLinkElement as any).tooltip();

    shareLinkElement.on('click', () => {
        let temp = $('<input>');
        $('body').append(temp);
        temp.val(shareLinkElement.html()).select();
        document.execCommand('copy');
        temp.remove();
        shareLinkElement.attr('data-bs-original-title', 'Copied to clipboard!');
        (shareLinkElement as any).tooltip('show');
    });

    shareLinkElement.on('hidden.bs.tooltip', () => {
        shareLinkElement.attr('data-bs-original-title', 'Copy to clipboard');
    });
});
