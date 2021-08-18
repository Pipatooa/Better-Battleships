let usernameElement: JQuery;
let passwordElement: JQuery;
let password2Element: JQuery;

let usernameFeedbackElement: JQuery;
let passwordFeedbackElement: JQuery;
let password2FeedbackElement: JQuery;

let formElement: JQuery;

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

    formElement = $('#form');

    usernameElement.on('change keyup', checkUsername);
    passwordElement.on('change keyup', () => checkPassword);
    password2Element.on('change keyup', checkPassword2);

    formElement.on('submit', () => {
        return checkUsername() && checkPassword() && checkPassword2();
    });
});