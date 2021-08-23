import console from 'console';
import {checkPassword, checkPassword2} from './check-password';
import {checkUsername} from './check-username';

/**
 * Submits registration form to the server
 */
export async function submitForm(formElement: JQuery,
                                 usernameElement: JQuery, usernameFeedbackElement: JQuery,
                                 passwordElement: JQuery, passwordFeedbackElement: JQuery,
                                 password2Element: JQuery, password2FeedbackElement: JQuery) {

    console.log('a');

    // Check if form data is valid
    let valid = checkUsername(usernameElement, usernameFeedbackElement)
        && checkPassword(passwordElement, passwordFeedbackElement)
        && checkPassword2(passwordElement, password2Element, password2FeedbackElement);

    console.log(valid);

    if (!valid)
        return;

    // Get CSRF token and create headers for request
    let csrfToken = $('meta[name="csrf-token"]').attr('content');
    let headers = new Headers();
    headers.set('CSRF-Token', csrfToken as string);

    // Get form data from form
    let formData = new FormData(formElement.get(0) as HTMLFormElement);

    // Submit form data
    let response = await fetch('', {
        method: 'POST',
        credentials: 'same-origin',
        headers: headers,
        body: formData
    });

    // Unpack JSON data
    let registrationResponse = await response.json() as IRegistrationResponse;

    // If request was successful, redirect user
    if (registrationResponse.success) {

        // Unpack search parameters
        let params = new URLSearchParams(window.location.search);

        // Redirect user to login page
        window.location.href = `/login${params.toString() ? `?${params.toString()}` : ''}`;
        return;
    }

    // If username was taken
    if (registrationResponse.message === 'Username taken') {
        usernameElement.addClass('is-invalid');
        usernameFeedbackElement.html('Username taken');
        return;
    }

    // Other failure mode
    console.log(registrationResponse);
}

/**
 * Type matching any registration response from server
 */
type IRegistrationResponse =
    IRegistrationSuccessResponse |
    IRegistrationFailureResponse;

/**
 * Interface describing success response from server
 */
interface IRegistrationSuccessResponse {
    success: true;
}

/**
 * Interface describing failure response from server
 */
interface IRegistrationFailureResponse {
    success: false,
    message: string
}
