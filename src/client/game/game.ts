import type { AbilityRenderer }       from './canvas/renderers/ability-renderer';
import type { GameRenderer }          from './canvas/renderers/game-renderer';
import type { ShipSelectionRenderer } from './canvas/renderers/ship-selection-renderer';
import type { Board }                 from './scenario/board';
import type { Region }                from './scenario/region';
import type { Team }                  from './team';

export let game: Game;

/**
 * Game - Client Version
 *
 * Stores all information about the current game state
 */
export class Game {

    public board: Board | undefined;
    public spawnRegion: Region | undefined;

    public gameRenderer: GameRenderer | undefined;
    public shipSelectionRenderer: ShipSelectionRenderer | undefined;
    public abilityRenderer: AbilityRenderer | undefined;

    /**
     * Game constructor
     *
     * @param  _teams Teams in the game
     */
    public constructor(protected readonly _teams: { [id: string]: Team }) {
        game = this;
    }

    /**
     * Getters and setters
     */

    public get teams(): { [id: string]: Team } {
        return this._teams;
    }
}
