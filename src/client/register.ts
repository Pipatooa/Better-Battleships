import {checkPassword, checkPassword2} from './register/check-password';
import {checkUsername} from './register/check-username';
import {submitForm} from './register/submit-form';

$(document).ready(() => {

    // Get elements using JQuery
    let usernameElement = $('#username');
    let passwordElement = $('#password');
    let password2Element = $('#password2');

    let usernameFeedbackElement = $('#username-feedback');
    let passwordFeedbackElement = $('#password-feedback');
    let password2FeedbackElement = $('#password2-feedback');

    let formElement = $('#form');

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
    formElement.on('submit', () => submitForm(
        formElement,
        usernameElement, usernameFeedbackElement,
        passwordElement, passwordFeedbackElement,
        password2Element, password2FeedbackElement
    ));

    // Update registration link to include search query parameters
    let escapedSearchParams = encodeURI(decodeURIComponent(window.location.search));
    $('#login-link').attr('href', `/login${escapedSearchParams}`);

});

