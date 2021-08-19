import {TileType} from './tiletype';

/**
 * Tile class - Server Version
 *
 * Stores a position and a tile type
 */
export class Tile {
    public constructor(public readonly x: number,
                       public readonly y: number,
                       private _tileType: TileType) {
    }
}