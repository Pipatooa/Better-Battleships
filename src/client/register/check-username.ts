/**
 * Username field validation for registration form
 *
 * @param    usernameElement         HTML element for username field
 * @param    usernameFeedbackElement HTML element for username feedback
 * @returns                          Whether field value was valid
 */
export function checkUsername(usernameElement: JQuery, usernameFeedbackElement: JQuery): boolean {
    const username = usernameElement.val() as string;

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
