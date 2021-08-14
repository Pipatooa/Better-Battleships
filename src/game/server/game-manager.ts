import * as console from 'console';
import {Game} from './game';
import {Scenario} from './scenario/scenario';

const gameLimit: number = 8;
export const gameJoinTimeout: number = 5000;
export const gameIDLength = 6;

const games: { [id: string]: Game } = {};
let numGames: number = 0;

export function capacityReached(): boolean {
    return numGames >= gameLimit;
}

function generateGameID(): string {
    let gameID: string;

    // Generate IDs until an ID which isn't used has been generated
    do {
        gameID = Math.random().toString().substr(2, gameIDLength);
    } while (gameID in games);

    // Return unique game ID
    return gameID;
}

export function createGame(scenario: Scenario): Game {

    // Create a random ID for the game
    let gameID: string = generateGameID();

    // Create game object and save it to list of games
    let game = new Game(gameID, scenario, removeGame);
    games[gameID] = game;
    numGames += 1;

    // Start timeout
    game.startTimeout(gameJoinTimeout);

    // Debug
    console.log(`Created game with id '${gameID}'. Current games: ${numGames}`);

    // Return created Game object
    return game;
}

export function removeGame(gameID: string) {
    delete games[gameID];
    numGames -= 1;

    // Debug
    console.log(`Removed game with id '${gameID}' (Timed out). Current games: ${numGames}`);
}

export function queryGame(gameID: string): Game | undefined {
    return games[gameID];
}
