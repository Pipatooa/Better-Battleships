import type { Board } from './scenario/board';
import type { Ship } from './scenario/ship';
import type { Team } from './team';

export let game: Game;

/**
 * Game - Client Version
 *
 * Stores all information about the current game state
 */
export class Game {

    public board: Board | undefined;
    public availableShips: Ship[] | undefined;
    public startRegionID: string | undefined;

    /**
     * Game constructor
     *
     * @param  _teams Teams in the game
     */
    public constructor(protected readonly _teams: { [id: string]: Team }) {
    }

    /**
     * Getters and setters
     */

    public get teams(): { [id: string]: Team } {
        return this._teams;
    }
}

/**
 * Creates singleton Game
 *
 * @param  teams Teams to pass to Game constructor
 */
export function initGame(teams: { [id: string]: Team }): void {
    game = new Game(teams);
}
