import console from 'console';

let usernameElement: JQuery;
let passwordElement: JQuery;
let password2Element: JQuery;

let usernameFeedbackElement: JQuery;
let passwordFeedbackElement: JQuery;
let password2FeedbackElement: JQuery;

/**
 * Username field validation for registration form
 * @returns boolean -- Whether field value was valid
 */
function checkUsername(): boolean {
    let username = usernameElement.val() as string;

    // Username field empty
    if (username === '') {
        usernameElement.addClass('is-invalid');
        usernameFeedbackElement.html('Username required');
        return false;
    }

    // Username too short
    if (username.length < 4) {
        usernameElement.addClass('is-invalid');
        usernameFeedbackElement.html('Username too short');
        return false;
    }

    // Username contains unsupported character
    if (!/^[a-zA-Z\-_\d.]+$/.test(username)) {
        usernameElement.addClass('is-invalid');
        usernameFeedbackElement.html('Username can only contain latin letters, digits, and the special characters - _ and .');
        return false;
    }

    usernameElement.removeClass('is-invalid');
    return true;
}

/**
 * Password field validation for registration form
 * @returns boolean -- Whether field value was valid
 */
function checkPassword(): boolean {
    let password = passwordElement.val() as string;

    // Password field empty
    if (password === '') {
        passwordElement.addClass('is-invalid');
        passwordFeedbackElement.html('Password required');
        return false;
    }

    // Password too short
    if (password.length < 8) {
        passwordElement.addClass('is-invalid');
        passwordFeedbackElement.html('Password too short');
        return false;
    }

    // Password must contain lowercase letter
    if (!/[a-z]/.test(password)) {
        passwordElement.addClass('is-invalid');
        passwordFeedbackElement.html('Password must contain lowercase letter');
        return false;
    }

    // Password must contain uppercase letter
    if (!/[A-Z]/.test(password)) {
        passwordElement.addClass('is-invalid');
        passwordFeedbackElement.html('Password must contain uppercase letter');
        return false;
    }

    // Password must contain digit
    if (!/\d/.test(password)) {
        passwordElement.addClass('is-invalid');
        passwordFeedbackElement.html('Password must contain a digit');
        return false;
    }

    // Password must contain at least one symbol
    if (!/[ -/:-@\[-`{-~]/.test(password)) {
        passwordElement.addClass('is-invalid');
        passwordFeedbackElement.html('Password must contain at least one symbol');
        return false;
    }

    // Password contains unsupported character
    if (!/^[a-zA-Z\d -/:-@\[-`{-~]+$/.test(password)) {
        passwordElement.addClass('is-invalid');
        passwordFeedbackElement.html('Password contains unsupported character');
        return false;
    }

    // Password is valid
    passwordElement.removeClass('is-invalid');
    return true;
}

/**
 * Password confirm field validation for registration form
 * @returns boolean -- Whether field value was valid
 */
function checkPassword2(): boolean {
    let password = passwordElement.val() as string;
    let password2 = password2Element.val() as string;

    // Passwords don't match
    if (password !== password2) {
        password2Element.addClass('is-invalid');
        password2FeedbackElement.html('Passwords must match');
        return false;
    }

    password2Element.removeClass('is-invalid');
    return true;
}

/**
 * Register event handlers
 */
$(document).ready(() => {
    usernameElement = $('#username');
    passwordElement = $('#password');
    password2Element = $('#password2');

    usernameFeedbackElement = $('#username-feedback');
    passwordFeedbackElement = $('#password-feedback');
    password2FeedbackElement = $('#password2-feedback');

    usernameElement.on('change keyup', checkUsername);
    passwordElement.on('change keyup', () => checkPassword);
    password2Element.on('change keyup', checkPassword2);

    let formElement = $('#form');

    // Update registration link to include search query parameters
    let escapedSearchParams = encodeURI(decodeURIComponent(window.location.search));
    $('#login-link').attr('href', `/login${escapedSearchParams}`);

    formElement.on('submit', async () => {

        // Check if form data is valid
        let valid = checkUsername() && checkPassword() && checkPassword2();
        if (!valid)
            return;

        // Get CSRF token and create headers for request
        let csrfToken = $('meta[name="csrf-token"]').attr('content');
        let headers = new Headers();
        headers.set('CSRF-Token', csrfToken as string);

        // Submit form data
        let response = await fetch('', {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers,
            body: new FormData(formElement.get(0) as HTMLFormElement)
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
    });
});

type IRegistrationResponse =
    IRegistrationSuccessResponse |
    IRegistrationFailureResponse;

interface IRegistrationSuccessResponse {
    success: true;
}

interface IRegistrationFailureResponse {
    success: false,
    message: string
}
