import {bindFileDrop, file} from './create-game/filedrop';
import ClickEvent = JQuery.ClickEvent;

let submitButton: JQuery;

let errorContainer: JQuery;
let errorMessageElement: JQuery;
let errorContextElement: JQuery;

$(document).ready(() => {
    bindFileDrop();

    submitButton = $('#submit-button');

    errorContainer = $('#error-container');
    errorMessageElement = $('#error-message');
    errorContextElement = $('#error-context');

    submitButton.on('click', async (ev: ClickEvent) => {
        let formData = new FormData();
        formData.append('file', file);
        formData.append('test', 'hello');

        let csrfToken = $('meta[name="csrf-token"]').attr('content');
        let headers = new Headers();
        headers.set('CSRF-Token', csrfToken as string);

        let res: Response = await fetch('/game/create', {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers,
            body: formData
        });

        let jsonResponse: IServerResponse = await res.json();

        if (jsonResponse.success)
            window.location.href = `/game/${jsonResponse.gameID}`;
        else {
            errorContainer.removeClass('d-none');
            errorMessageElement.html(jsonResponse.message);
            errorContextElement.html(jsonResponse.context);
        }
    });
});

type IServerResponse = ISuccessResponse | IFailureResponse;

interface ISuccessResponse {
    success: true,
    gameID: string,
    debug: string
}

interface IFailureResponse {
    success: false,
    message: string,
    context: string
}
