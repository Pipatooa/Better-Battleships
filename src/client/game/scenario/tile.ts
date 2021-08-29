import { TileType } from './tiletype';

/**
 * Tile class - Client Version
 *
 * Stores a position and a tile type
 */
export class Tile {

    /**
     * Tile constructor
     *
     * @param  x        X coordinate of tile
     * @param  y        Y coordinate of tile
     * @param  tileType Type of this tile
     */
    public constructor(public readonly x: number,
                       public readonly y: number,
                       public tileType: TileType) {
    }
}