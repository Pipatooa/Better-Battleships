$(document).ready(() => {
    const formElement = $('#form');
    const formFeedbackElement = $('#form-feedback');

    // Update registration link to include search query parameters
    const escapedSearchParams = encodeURI(decodeURIComponent(window.location.search));
    $('#register-link').attr('href', `/register${escapedSearchParams}`);

    formElement.on('submit', async () => {

        // Get CSRF token and create headers for request
        const csrfToken = $('meta[name="csrf-token"]').attr('content');
        const headers = new Headers();
        headers.set('CSRF-Token', csrfToken!);

        // Submit form data
        const response = await fetch('', {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers,
            body: new FormData(formElement.get(0) as HTMLFormElement)
        });

        // Unpack JSON data
        const loginResponse = await response.json() as ILoginResponse;

        // If request was successful, redirect user
        if (loginResponse.success) {

            // Unpack search parameters
            const params = new URLSearchParams(window.location.search);

            // Redirect user to url if provided in search parameters, or to home page otherwise
            window.location.href = params.has('r') ? params.get('r')! : '/';
            return;
        }

        // If unsuccessful
        formFeedbackElement.html(loginResponse.message);
    });
});

type ILoginResponse =
    ILoginSuccessResponse |
    ILoginFailureResponse;

interface ILoginSuccessResponse {
    success: true;
}

interface ILoginFailureResponse {
    success: false,
    message: string
}
