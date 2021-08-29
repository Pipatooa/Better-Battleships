import { registerShareLinkHandlers } from './game/share-link-tooltip';
import { ready } from './game/sockets/button-functions';
import { openSocketConnection } from './game/sockets/opener';

openSocketConnection();

$(document).ready(() => {

    registerShareLinkHandlers();

    // Register ready button
    $('#ready-button').on('click', () => ready(true));
});
