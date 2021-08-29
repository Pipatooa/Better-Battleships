import { IBoardInfo } from '../../../shared/network/scenario/i-board-info';
import { Tile } from './tile';
import { TileType } from './tiletype';

/**
 * Board - Client Version
 *
 * Stores all information about the tiles of the board and objects on the board
 */
export class Board {

    /**
     * Board constructor
     *
     * @param  tiles 2d array of tiles indexed [y][x]
     */
    public constructor(public readonly tiles: Tile[][]) {
    }

    /**
     * Factory function to generate Board from JSON event data
     *
     * @param    boardSource JSON data from server
     * @returns              Created Board object
     */
    public static async fromSource(boardSource: IBoardInfo): Promise<Board> {

        // Unpack tile types
        const tileTypes: { [char: string]: TileType } = {};
        for (const entry of Object.entries(boardSource.tileTypes)) {

            // Create new TileType objects indexed by single character strings
            const [ char, tileTypeInfo ] = entry;
            tileTypes[char] = await TileType.fromSource(tileTypeInfo);
        }

        // Unpack tile data
        const tiles: Tile[][] = [];
        for (let y = 0; y < boardSource.tiles.length; y++) {
            const row: string = boardSource.tiles[y];

            // Create new tile row
            tiles[y] = [];

            // Iterate through each character, each representing a tile
            for (let x = 0; x < boardSource.size[0]; x++) {
                const c: string = row.charAt(x);

                // Create and store a new tile created from tile type
                // Tiles are stored in tile[y][x] format
                const tileType: TileType = tileTypes[c];
                tiles[y][x] = new Tile(x, y, tileType);
            }
        }

        return new Board(tiles);
    }

    /**
     * Getters and setters
     */

    public get size(): [number, number] {
        return [ this.tiles[0].length, this.tiles.length ];
    }
}
