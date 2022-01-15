import { file } from './filedrop';

/**
 * Submits game create request to the server
 *
 * @param  errorContainer      HTML element containing all error information
 * @param  errorMessageElement HTML element showing error message
 * @param  errorContextElement HTML element showing error context message
 */
export async function createCustomGame(errorContainer: JQuery, errorMessageElement: JQuery, errorContextElement: JQuery): Promise<void> {

    // Create new form for game settings
    const formData = new FormData();
    formData.append('file', file);

    // Get CSRF token and create headers for request
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    const headers = new Headers();
    headers.set('CSRF-Token', csrfToken!);

    // Submit request
    const res: Response = await fetch('/game/create', {
        method: 'POST',
        credentials: 'same-origin',
        headers: headers,
        body: formData
    });

    // Unpack JSON data
    const serverResponse = await res.json() as IGameCreationResponse;

    // If successful, redirect user to game joining screen
    if (serverResponse.success)
        window.location.href = `/game/${serverResponse.gameID}${window.location.search}`;

    // Otherwise, display problem to user
    else {
        errorContainer.removeClass('d-none');
        errorMessageElement.text(serverResponse.message);
        errorContextElement.text(serverResponse.context);
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
    gameID: string
}

/**
 * Interface describing failure response from server
 */
interface IGameCreationFailureResponse {
    success: false,
    message: string,
    context: string
}
