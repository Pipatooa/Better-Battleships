import console           from 'console';
import config            from '../config/config';
import { queryDatabase } from '../db/query';
import { Game }          from './game';
import type { Scenario } from './scenario/objects/scenario';

const games: { [id: string]: Game } = {};
let numGames = 0;

/**
 * Checks whether the number of concurrent games matches or exceeds the game limit
 *
 * @returns  Whether the limit is matched or exceeded
 */
export function capacityReached(): boolean {
    return numGames >= config.gameLimit;
}

/**
 * Generates a new unique game ID that does not match an existing game ID
 *
 * @returns  Generated unique ID
 */
function generateGameID(): string {
    let gameID: string;

    // Generate IDs until an ID which isn't used has been generated
    do {
        gameID = Math.random().toString().substr(2, config.gameIDLength);
    } while (games[gameID] !== undefined);

    // Return unique game ID
    return gameID;
}

/**
 * Creates a new game using a scenario
 *
 * @param    scenario Scenario to use for game
 * @param    fileHash Hash of scenario file
 * @returns           Created Game object
 */
export async function createGame(scenario: Scenario, fileHash: string): Promise<Game> {

    // Create a random ID for the game
    const gameID: string = generateGameID();

    // Create database entry for uploaded scenario
    let query = 'INSERT INTO scenario VALUES (?, FALSE, ?, ?, ?) ON DUPLICATE KEY UPDATE hash=hash;';
    await queryDatabase(query, [fileHash, scenario.author, scenario.descriptor.name, scenario.descriptor.description]);

    // Create database entry for game
    query = 'INSERT INTO game (game_id, scenario) VALUES (?, ?) RETURNING id;';
    const rows = await queryDatabase(query, [ gameID, fileHash ]);
    const gameInternalID = rows[0].id;

    // Create game object and save it to list of games
    const game = new Game(gameInternalID, gameID, scenario);

    games[gameID] = game;
    numGames++;

    // Set game timeout function and start timeout
    game.timeoutManager.setTimeoutFunction('gameJoinTimeout', () => removeGame(gameID, 'Timed out'), config.gameJoinTimeout, false);
    game.timeoutManager.startTimeout('gameJoinTimeout');

    // When the game ends, remove it
    game.gameOverCallback = (reason: string) => removeGame(gameID, reason);

    // Debug
    console.log(`Created game with id '${gameID}'. Current games: ${numGames}`);

    // Return created Game object
    return game;
}

/**
 * Removes a game from the list of concurrent games
 *
 * @param  gameID ID of game to remove
 * @param  reason Reason for game removal
 */
export function removeGame(gameID: string, reason: string): void {

    // Remove the game and decrement number of concurrent games
    const deleted = delete games[gameID];
    if (!deleted)
        return;
    numGames--;

    // Debug
    console.log(`Removed game with id '${gameID}' (${reason}). Current games: ${numGames}`);
}

/**
 * Fetches a game from list of games using a game ID
 *
 * @param    gameID ID of game to find
 * @returns         Found game | undefined
 */
export function queryGame(gameID: string): Game | undefined {
    return games[gameID];
}
