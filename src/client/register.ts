import { checkPassword, checkPassword2 } from './register/check-password';
import { checkUsername }                 from './register/check-username';
import { submitForm }                    from './register/submit-form';

$(document).ready(() => {

    // Get elements using JQuery
    const usernameElement = $('#username');
    const passwordElement = $('#password');
    const password2Element = $('#password2');

    const usernameFeedbackElement = $('#username-feedback');
    const passwordFeedbackElement = $('#password-feedback');
    const password2FeedbackElement = $('#password2-feedback');

    const formElement = $('#form');

    // Register event handlers for form fields
    usernameElement.on('change keyup', () => {
        checkUsername(usernameElement, usernameFeedbackElement);
    });
    passwordElement.on('change keyup', () => {
        checkPassword(passwordElement, passwordFeedbackElement);
        checkPassword2(passwordElement, password2Element, password2FeedbackElement);
    });
    password2Element.on('change keyup', () => {
        checkPassword2(passwordElement, password2Element, password2FeedbackElement);
    });

    // Register form submission handler
    formElement.on('submit', async () => submitForm(
        formElement,
        usernameElement, usernameFeedbackElement,
        passwordElement, passwordFeedbackElement,
        password2Element, password2FeedbackElement
    ));

    // Update registration link to include search query parameters
    const escapedSearchParams = encodeURI(decodeURIComponent(window.location.search));
    $('#login-link').attr('href', `/login${escapedSearchParams}`);

});

