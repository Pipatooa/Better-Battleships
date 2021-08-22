import {file} from './filedrop';

/**
 * Submits game create request to the server
 */
export async function submit(errorContainer: JQuery, errorMessageElement: JQuery, errorContextElement: JQuery) {

    // Create new form for game settings
    let formData = new FormData();
    formData.append('file', file);

    // Get CSRF token and create headers for request
    let csrfToken = $('meta[name="csrf-token"]').attr('content');
    let headers = new Headers();
    headers.set('CSRF-Token', csrfToken as string);

    // Submit request
    let res: Response = await fetch('/game/create', {
        method: 'POST',
        credentials: 'same-origin',
        headers: headers,
        body: formData
    });

    // Unpack JSON data
    let serverResponse = await res.json() as IGameCreationResponse;

    // If successful, redirect user to game joining screen
    if (serverResponse.success)
        window.location.href = `/game/${serverResponse.gameID}`;

    // Otherwise, display problem to user
    else {
        errorContainer.removeClass('d-none');
        errorMessageElement.html(serverResponse.message);
        errorContextElement.html(serverResponse.context);
    }
}

/**
 * Type matching any game creation response from server
 */
type IGameCreationResponse =
    IGameCreationSuccessResponse |
    IGameCreationFailureResponse;

/**
 * Interface describing success response from server
 */
interface IGameCreationSuccessResponse {
    success: true,
    gameID: string,
    debug: string
}

/**
 * Interface describing failure response from server
 */
interface IGameCreationFailureResponse {
    success: false,
    message: string,
    context: string
}
