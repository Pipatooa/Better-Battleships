$(document).ready(() => {
    let formElement = $('#form');
    let formFeedbackElement = $('#form-feedback');

    // Update registration link to include search query parameters
    $('#register-link').attr('href', `/register${window.location.search}`);

    formElement.on('submit', async () => {

        // Submit form data
        let response = await fetch('', {
            method: 'POST',
            body: new FormData(formElement.get(0) as HTMLFormElement)
        });

        // Unpack JSON data
        let loginResponse = await response.json() as ILoginResponse;

        // If request was successful, redirect user
        if (loginResponse.success) {

            // Unpack search parameters
            let params = new URLSearchParams(window.location.search);

            // Redirect user to url if provided in search parameters, or to home page otherwise
            window.location.href = params.has('r') ? params.get('r') as string : '/';
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
    success: true
}

interface ILoginFailureResponse {
    success: false,
    message: string
}