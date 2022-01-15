import { openSocketConnection } from './game/sockets/opener';
import { initiateLobbyUI }      from './game/ui/initiate';

export const searchParams = new URLSearchParams(window.location.search);
openSocketConnection();

/**
 * Called when page has finished loading
 */
$(document).ready(() => {
    initiateLobbyUI();
});
