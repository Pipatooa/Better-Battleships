/**
 * Attempts to join a game
 *
 * @param  gameIDElement  HTML element for game id field
 * @param  gameIDFeedback HTML element for game id feedback
 */
export async function joinGame(gameIDElement: JQuery, gameIDFeedback: JQuery): Promise<void> {

    const gameID = gameIDElement.val() as string;

    // Check game id validity
    if (!/^\d+$/.test(gameID)) {
        gameIDElement.addClass('is-invalid');
        gameIDFeedback.html('Invalid game id');
        return;
    }

    // Query whether or not game exists
    const result = await fetch(`http://localhost:8080/game/${gameID}?q=1`, {
        'method': 'GET',
        'mode': 'cors'
    });
    const resultData = await result.json();

    // Redirect user is game exists
    if (resultData.exists === true) {
        window.location.href = `/game/${gameID}${window.location.search}`;
        return;
    }

    // Provide appropriate feedback otherwise
    gameIDElement.addClass('is-invalid');
    gameIDFeedback.html(resultData.message);
}
