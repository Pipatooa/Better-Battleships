const gameList = $('#game-list');
const queryStatus = $('#query-status');

const gameIDField = $('#game-id').get(0) as HTMLInputElement;
const scenarioHashField = $('#scenario-hash').get(0) as HTMLInputElement;
const usernameField = $('#username').get(0) as HTMLInputElement;
const scenarioTypeSelection = $('#scenario-type').get(0) as HTMLSelectElement;

/**
 * Interface describing a retrieved game from the server
 */
interface Game {
    id: number,
    game_id: string,
    scenario: string,
    hash: string,
    name: string,
    description: string,
    timestamp: string,
    completion: string,
    builtin: 1 | 0,
    results: { [username: string]: boolean }
}

/**
 * Document load function
 */
$(async () => {
    const games = await getGames('', '', '', true);
    if (games !== undefined)
        displayGames(games);
});

/**
 * Search button
 */
$('#search-button').on('click', async () => {

    const gameID = gameIDField.value;
    const scenarioHash = scenarioHashField.value;
    const username = usernameField.value;
    const scenarioType = scenarioTypeSelection.value;
    let builtin: boolean | undefined;
    switch (scenarioType) {
        case '1':
            builtin = true;
            break;
        case '2':
            builtin = false;
            break;
    }
    const games = await getGames(gameID, scenarioHash, username, builtin);
    if (games !== undefined)
        displayGames(games);
});

/**
 * Fetches a set of games from the server
 *
 * @param    scenarioID   Start of scenario ID
 * @param    scenarioHash Full hash of scenario for games
 * @param    username     Username of player to look for games
 * @param    builtin      Filter games by whether they are built-in or not
 * @returns               Array of game information. Will return undefined in case of an error.
 */
async function getGames(scenarioID: string, scenarioHash: string, username: string, builtin: boolean | undefined): Promise<Game[] | undefined> {

    // Create a set of search parameters to send to server
    const searchParams = new URLSearchParams();
    if (scenarioID) searchParams.set('id', scenarioID);
    if (scenarioHash) searchParams.set('scenario', scenarioHash);
    if (username) searchParams.set('user', username);
    if (builtin !== undefined) searchParams.set('builtin', builtin ? '1' : '0');

    queryStatus.text('Fetching Results...');

    // Fetch a list of games
    const mainResponse = await fetch(`/stats/api/games?${searchParams.toString()}`);
    if (mainResponse.status !== 200) {
        queryStatus.text(`Error ${mainResponse.statusText}: ${mainResponse.statusText}`);
        return undefined;
    }
    const games: Game[] = await mainResponse.json();

    // Fetch results for each game in separate API calls and add them to results
    for (const game of games) {
        const gameResponse = await fetch(`/stats/api/game/${game.id}`);
        if (gameResponse.status !== 200) {
            queryStatus.text(`Error ${mainResponse.statusText}: ${mainResponse.statusText}`);
            return undefined;
        }
        game.results = (await gameResponse.json()).results;
    }

    return games;
}

/**
 * Displays a list of games to the user
 *
 * @param  games Array of games to display
 */
function displayGames(games: Game[]): void {

    gameList.children().remove();
    queryStatus.text('');

    for (const game of games) {
        const idElement = $('<b></b>').text(`${game.game_id}:`);
        const heading = $('<h5></h5>').append(idElement);

        const scenarioName = $('<b></b>').text(`Scenario: ${game.name} ${game.builtin ? '(Built In)' : '(Custom)'}`);
        /*const scenarioHash = $('<b></b>').text(game.hash);
        const scenarioHeading = $('<div class="d-flex justify-content-between"></div>').append(scenarioName, scenarioHash);*/
        const scenarioDescription = $('<p></p>').text(game.description);
        const scenarioSection = $('<div></div>').append(scenarioName, scenarioDescription);

        const timestampDate = new Date(game.timestamp);
        const timestampString = timestampDate.toLocaleString();
        const durationSeconds = (new Date(game.completion).getTime() - timestampDate.getTime()) / 1000;
        const durationString = `${Math.floor(durationSeconds / 60)}:${durationSeconds % 60}`;

        const resultsContainer = $('<div class="d-flex mt-2 justify-content-start"></div>');
        for (const [username, won] of Object.entries(game.results)) {
            const resultInner = $(`<span class="result me-2 py-1 px-2 border border-2 border-dark rounded-3 ${won ? 'won' : 'lost'}"></span>`).text(username);
            const result = $('<div></div>').append(resultInner);
            resultsContainer.append(result);
        }
        const resultsSection = $('<b>Results:</b>').append(resultsContainer);

        // const detailsButton = $('<button class="btn btn-dark">Details</button>');
        const timestamp = $('<b class="my-auto"></b>').text(`Timestamp: ${timestampString}`);
        const duration = $('<b class="my-auto"></b>').text(`Duration: ${durationString}`);
        const timeDetails = $('<div class="d-flex flex-grow-1 justify-content-between"></div>').append(timestamp, duration);
        const detailsSection = $('<div class="d-flex mt-3 mb-1 justify-content-between"></div>').append(resultsSection, timeDetails);

        const scenarioHash = $('<b></b>').text(`Scenario Hash: ${game.hash}`);

        const gameElement = $('<div class="mt-3 p-3 border border-dark rounded-3"></div>').append(heading, scenarioSection, resultsSection, detailsSection, scenarioHash);
        gameList.append(gameElement);
    }
}
