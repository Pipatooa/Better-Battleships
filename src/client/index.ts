import { bindFileDrop, setFileFromDownload } from './index/filedrop';
import { createCustomGame } from './index/create-custom-game';
import { joinGame } from './index/join-game';

$(document).ready(async () => {

    // Read dev flags
    const searchParams = new URLSearchParams(window.location.search);

    // Register file drop handlers
    bindFileDrop();

    // Cache JQuery elements
    const errorContainer = $('#error-container');
    const errorMessageElement = $('#error-message');
    const errorContextElement = $('#error-context');

    // If default scenario flag is set, auto-submit form
    if (searchParams.has('scenario')) {
        await setFileFromDownload(`/scenarios/${searchParams.get('scenario')}.zip`);
        await createCustomGame(errorContainer, errorMessageElement, errorContextElement);
    }

    // Selected tab listener
    type SelectedTab = 'nav-scenario-built-in-tab' | 'nav-scenario-custom-tab';
    let selectedTab: SelectedTab = 'nav-scenario-built-in-tab';
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', (ev) => selectedTab = ev.target.id as SelectedTab);

    // Create game button handler
    $('#create-game-button').on('click', async () => {
        switch (selectedTab) {
            case 'nav-scenario-built-in-tab':
                break;
            case 'nav-scenario-custom-tab':
                await createCustomGame(errorContainer, errorMessageElement, errorContextElement);
        }
    });

    // Join game button
    const gameIDElement = $('#game-id');
    const gameIDFeedback = $('#game-id-feedback');
    $('#join-game-form').on('submit', async () => joinGame(gameIDElement, gameIDFeedback));
});
