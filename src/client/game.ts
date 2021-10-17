import { registerShareLinkHandlers } from './game/share-link-tooltip';
import { placementDone, ready } from './game/sockets/button-functions';
import { openSocketConnection } from './game/sockets/opener';

openSocketConnection();

export let searchParams: URLSearchParams;
export let flags: string;

$(document).ready(() => {

    // Read dev flags
    searchParams = new URLSearchParams(window.location.search);
    flags = searchParams.has('flags') ? searchParams.get('flags')! : '';

    // Prepare share link
    registerShareLinkHandlers();

    // Register buttons
    $('#ready-button').on('click', () => ready(true));
    $('#button-placement-done').on('click', () => placementDone());
});
