import { bindFileDrop, setFileFromDownload } from './create-game/filedrop';
import { submit } from './create-game/submit';

let submitButton: JQuery;

let errorContainer: JQuery;
let errorMessageElement: JQuery;
let errorContextElement: JQuery;

$(document).ready(async () => {

    // Read dev flags
    const searchParams = new URLSearchParams(window.location.search);

    // Register file drop handlers
    bindFileDrop();

    // Get elements using JQuery
    submitButton = $('#submit-button');

    errorContainer = $('#error-container');
    errorMessageElement = $('#error-message');
    errorContextElement = $('#error-context');

    // Register submit button handler
    submitButton.on('click', async () => await submit(errorContainer, errorMessageElement, errorContextElement));

    // If default scenario flag is set, auto-submit form
    if (searchParams.has('scenario')) {
        await setFileFromDownload(`/scenarios/${searchParams.get('scenario')}.zip`);
        await submit(errorContainer, errorMessageElement, errorContextElement);
    }
});
