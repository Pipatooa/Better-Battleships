import type { IBoardInfo } from '../../../shared/network/scenario/i-board-info';
import { Region } from './region';
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

        // Unpack tile and region palettes
        const tileTypes: { [char: string]: TileType } = {};
        for (const entry of Object.entries(boardSource.tilePalette)) {
            const [ char, tileTypeInfo ] = entry;
            tileTypes[char] = await TileType.fromSource(tileTypeInfo);
        }

        const regions: { [id: string]: Region } = {};
        for (const regionIDs of Object.values(boardSource.regionPalette)) {
            for (const regionID of regionIDs) {
                if (regions[regionID] === undefined)
                    regions[regionID] = new Region(regionID);
            }
        }

        // Unpack tile data
        const tiles: Tile[][] = [];
        for (let y = 0; y < boardSource.tiles.length; y++) {
            const rowTileTypes: string = boardSource.tiles[y];
            const rowRegions: string = boardSource.regions[y];

            // Create new tile row
            tiles[y] = [];

            // Iterate through each character, each representing a tile
            for (let x = 0; x < boardSource.size[0]; x++) {
                const tileTypeChar: string = rowTileTypes.charAt(x);
                const regionChar: string = rowRegions.charAt(x);

                const tileType: TileType = tileTypes[tileTypeChar];
                const regionIDs: string[] = boardSource.regionPalette[regionChar];
                tiles[y][x] = [tileType, regionIDs.map(id => regions[id])];
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

/**
 * Type describing an entry for a single tile
 */
export type Tile = [TileType, Region[]];
