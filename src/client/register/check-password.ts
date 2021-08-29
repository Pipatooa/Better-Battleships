/**
 * Password field validation for registration form
 *
 * @param    passwordElement         HTML element for password field
 * @param    passwordFeedbackElement HTML element for password feedback
 * @returns                          Whether field value was valid
 */
export function checkPassword(passwordElement: JQuery, passwordFeedbackElement: JQuery): boolean {
    const password = passwordElement.val() as string;

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
    if (!/[ -/:-@[-`{-~]/.test(password)) {
        passwordElement.addClass('is-invalid');
        passwordFeedbackElement.html('Password must contain at least one symbol');
        return false;
    }

    // Password contains unsupported character
    if (!/^[a-zA-Z\d -/:-@[-`{-~]+$/.test(password)) {
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
 *
 * @param    passwordElement          HTML element for password field
 * @param    password2Element         HTML element for password confirmation field
 * @param    password2FeedbackElement HTML element for password confirmation feedback
 * @returns                           Whether field value was valid
 */
export function checkPassword2(passwordElement: JQuery, password2Element: JQuery, password2FeedbackElement: JQuery): boolean {

    // Get password and password2 field values
    const password = passwordElement.val() as string;
    const password2 = password2Element.val() as string;

    // Passwords don't match
    if (password !== password2) {
        password2Element.addClass('is-invalid');
        password2FeedbackElement.html('Passwords must match');
        return false;
    }

    password2Element.removeClass('is-invalid');
    return true;
}