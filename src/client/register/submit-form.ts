import { checkPassword, checkPassword2 } from './check-password';
import { checkUsername }                 from './check-username';

/**
 * Submits registration form to the server
 *
 * @param  formElement              HTML element for form
 * @param  usernameElement          HTML element for username field
 * @param  usernameFeedbackElement  HTML element for username feedback
 * @param  passwordElement          HTML element for password field
 * @param  passwordFeedbackElement  HTML element for password feedback
 * @param  password2Element         HTML element for password confirmation field
 * @param  password2FeedbackElement HTML element for password confirmation feedback
 */
export async function submitForm(formElement: JQuery,
                                 usernameElement: JQuery, usernameFeedbackElement: JQuery,
                                 passwordElement: JQuery, passwordFeedbackElement: JQuery,
                                 password2Element: JQuery, password2FeedbackElement: JQuery): Promise<void> {

    // Check if form data is valid
    const valid = checkUsername(usernameElement, usernameFeedbackElement)
        && checkPassword(passwordElement, passwordFeedbackElement)
        && checkPassword2(passwordElement, password2Element, password2FeedbackElement);

    if (!valid)
        return;

    // Get CSRF token and create headers for request
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    const headers = new Headers();
    headers.set('CSRF-Token', csrfToken!);

    // Get form data from form
    const formData = new FormData(formElement.get(0) as HTMLFormElement);

    // Submit form data
    const response = await fetch('', {
        method: 'POST',
        credentials: 'same-origin',
        headers: headers,
        body: formData
    });

    // Unpack JSON data
    const registrationResponse = await response.json() as IRegistrationResponse;

    // If request was successful, redirect user
    if (registrationResponse.success) {

        // Unpack search parameters
        const params = new URLSearchParams(window.location.search);

        // Redirect user to login page
        window.location.href = `/login${params.toString() ? `?${params.toString()}` : ''}`;
        return;
    }

    // Otherwise, display reason
    usernameElement.addClass('is-invalid');
    usernameFeedbackElement.text(registrationResponse.message);
    return;
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
