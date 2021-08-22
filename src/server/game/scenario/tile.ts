import {TileType} from './tiletype';

/**
 * Tile class - Server Version
 *
 * Stores a position and a tile type
 */
export class Tile {

    /**
     * Tile constructor
     * @param x         X coordinate of tile
     * @param y         Y coordinate of tile
     * @param _tileType Type of this tile
     */
    public constructor(public readonly x: number,
                       public readonly y: number,
                       private _tileType: TileType) {
    }
}