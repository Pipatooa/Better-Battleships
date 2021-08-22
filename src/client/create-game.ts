import {bindFileDrop} from './create-game/filedrop';
import {submit} from './create-game/submit';

let submitButton: JQuery;

let errorContainer: JQuery;
let errorMessageElement: JQuery;
let errorContextElement: JQuery;

$(document).ready(() => {

    // Register file drop handlers
    bindFileDrop();

    // Get elements using JQuery
    submitButton = $('#submit-button');

    errorContainer = $('#error-container');
    errorMessageElement = $('#error-message');
    errorContextElement = $('#error-context');

    // Register submit button handler
    submitButton.on('click', () => submit(errorContainer, errorMessageElement, errorContextElement));
});
