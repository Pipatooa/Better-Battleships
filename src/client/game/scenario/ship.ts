import { game }                  from '../game';
import type { Player }           from '../player';
import type { Ability }          from './abilities/ability';
import type { Board }            from './board';
import type { Descriptor }       from './descriptor';
import type { RotatablePattern } from './rotatable-pattern';
import type { Rotation }         from 'shared/scenario/objects/common/rotation';

/**
 * Ship - Client Version
 *
 * Movable object that exists on the board
 */
export class Ship {

    public board: Board | undefined;
    private _selected = false;

    /**
     * Ship constructor
     *
     * @param  index      Index of this ship in player's ship list
     * @param  _x         X coordinate of ship
     * @param  _y         Y coordinate of ship
     * @param  descriptor Descriptor for ship
     * @param  pattern    Pattern describing shape of ship
     * @param  player     Player that this ship belongs to
     * @param  abilities  Dictionary of abilities available for this ship
     */
    public constructor(public readonly index: number | undefined,
                       protected _x: number | undefined,
                       protected _y: number | undefined,
                       public readonly descriptor: Descriptor,
                       public pattern: RotatablePattern,
                       public readonly player: Player,
                       public readonly abilities: Ability[]) {
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        this.board?.removeShip(this, true);
    }

    /**
     * Moves this ship to a new position on the board
     *
     * @param    x New X coordinate of ship
     * @param    y New y coordinate of ship
     * @returns    Whether or not the ship was moved
     */
    public moveTo(x: number | undefined, y: number | undefined): boolean {
        if (x == this._x && y == this._y)
            return false;

        this.board?.removeShip(this, false);
        this._x = x;
        this._y = y;
        this.board?.addShip(this, false);
        return true;
    }

    /**
     * Updates board information for the area that the ship currently occupies
     */
    public updateArea(): void {
        const [maxX, maxY] = this.pattern.getBounds();
        this.board?.informationGenerator!.updateArea(this._x!, this._y!, this._x! + maxX, this._y! + maxY);
        this.board?.informationGenerator!.push();
    }

    /**
     * Checks whether or not this ship's placement is valid
     *
     * @param    x     Suggested X coordinate of ship placement
     * @param    y     Suggested Y coordinate of ship placement
     * @param    board Board to place ship on
     * @returns        Whether this ship's placement is valid
     */
    public checkPlacementValid(x: number, y: number, board: Board): [true, undefined] | [false, string] {

        // Iterate through tiles to check if all are within spawn region
        for (const [dx, dy] of this.pattern.patternEntries) {
            const tileX = x + dx;
            const tileY = y + dy;
            const tile = board.tiles[tileY]?.[tileX];

            if (!tile?.[1].map(r => r.id).includes(game.spawnRegionID!))
                return [false, 'Ship must be placed within spawn region'];

            if (tile[2] !== undefined)
                return [false, 'Ships must not be overlapping'];

            if (!tile[0].traversable)
                return [false, 'Ship must be placed on traversable tiles'];
        }

        return [true, undefined];
    }


    /**
     * Rotates the ship in place
     *
     * @param  rotation Amount to rotate ship by
     */
    public rotate(rotation: Rotation): void {
        this.pattern = this.pattern.rotated(rotation);
    }

    /**
     * Getters and setters
     */

    public get x(): number | undefined {
        return this._x;
    }

    public get y(): number | undefined {
        return this._y;
    }

    public get selected(): boolean {
        return this._selected;
    }

    public set selected(selected: boolean) {
        this._selected = selected;
        this.updateArea();
    }
}
