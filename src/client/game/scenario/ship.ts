import type { BoardInfoGenerator } from '../canvas/board-info-generator';
import type { Player } from '../player';
import type { Ability } from './abilities/ability';
import type { Board } from './board';
import type { Descriptor } from './descriptor';
import type { Pattern } from './pattern';

/**
 * Ship - Client Version
 *
 * Movable object that exists on the board
 */
export class Ship {

    public board: Board | undefined;
    public selected = false;

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
                       public pattern: Pattern,
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
     *
     * @param  boardInfoGenerator Board information generator to update information with
     */
    public updateArea(boardInfoGenerator: BoardInfoGenerator): void {
        const [maxX, maxY] = this.pattern.getBounds();
        boardInfoGenerator.updateArea(this._x!, this._y!, this._x! + maxX, this._y! + maxY);
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
}
