import { Region }                  from './region';
import { TileType }                from './tiletype';
import type { BoardInfoGenerator } from '../ui/canvas/board-info-generator';
import type { BoardRenderer }      from '../ui/canvas/renderers/board-renderer';
import type { Ship }               from './ship';
import type { IBoardInfo }         from 'shared/network/scenario/i-board-info';

/**
 * Board - Client Version
 *
 * Stores all information about the tiles of the board and objects on the board
 */
export class Board {

    public readonly size: [number, number];
    protected _ships: Ship[] = [];

    public readonly regions: { [id: string]: Region };

    public renderer: BoardRenderer | undefined;
    public informationGenerator: BoardInfoGenerator | undefined;

    /**
     * Board constructor
     *
     * @param  tiles           2d array of tiles indexed [y][x]
     * @param  tileTypes       Array of tile types composing the board
     * @param  primaryTileType Tile type which will be used to generate ship selection board
     */
    public constructor(public readonly tiles: Tile[][],
                       public readonly tileTypes: TileType[],
                       public readonly primaryTileType: TileType) {
        this.size = [this.tiles[0].length, this.tiles.length];

        this.regions = {};
        for (const row of this.tiles) {
            for (const tile of row) {
                for (const region of tile[1]) {
                    if (this.regions[region.id] === undefined)
                        this.regions[region.id] = region;
                }
            }
        }
    }

    /**
     * Factory function to generate Board from JSON event data
     *
     * @param    boardSource JSON data from server
     * @returns              Created Board object
     */
    public static async fromSource(boardSource: IBoardInfo): Promise<Board> {

        // Unpack tile and region palettes
        let primaryTileType: TileType | undefined;
        const tileTypes: { [char: string]: TileType } = {};
        for (const entry of Object.entries(boardSource.tilePalette)) {
            const [ char, tileTypeInfo ] = entry;
            const tileType = await TileType.fromSource(tileTypeInfo);
            tileTypes[char] = tileType;
            if (primaryTileType === undefined)
                primaryTileType = tileType;
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
                tiles[y][x] = [tileType, regionIDs.map(id => regions[id]), undefined, undefined];
            }
        }

        return new Board(tiles, Object.values(tileTypes), primaryTileType!);
    }

    /**
     * Adds a ship to the board
     *
     * @param  ship       Ship to add to the board
     * @param  updateList Whether to update list of ships on the board
     */
    public addShip(ship: Ship, updateList: boolean): void {
        if (updateList) {
            this._ships.push(ship);
            ship.board = this;
        }

        if (ship.x === undefined || ship.y === undefined)
            return;

        for (const [dx, dy] of ship.pattern.patternEntries) {
            const x = ship.x + dx;
            const y = ship.y + dy;
            const tile = this.tiles[y]?.[x];
            if (tile !== undefined) {
                tile[2] = ship;
                this.informationGenerator?.updateTile(x, y, tile);
            }
        }
    }

    /**
     * Removes a ship from the board
     *
     * @param  ship       Ship to remove
     * @param  updateList Whether to update list of ships on the board
     */
    public removeShip(ship: Ship, updateList: boolean): void {
        if (updateList) {
            this._ships = this._ships.filter((s) => s !== ship);
            ship.board = undefined;
        }

        if (ship.x === undefined || ship.y === undefined)
            return;

        for (const [dx, dy] of ship.pattern.patternEntries) {
            const x = ship.x + dx;
            const y = ship.y + dy;
            const tile = this.tiles[y]?.[x];
            if (tile !== undefined) {
                tile[2] = undefined;
                this.informationGenerator?.updateTile(x, y, tile);
            }
        }
    }

    /**
     * Getters and setters
     */

    public get ships(): Ship[] {
        return this._ships;
    }
}

/**
 * Type describing an entry for a single tile
 */
export type Tile = [TileType, Region[], Ship | undefined, (() => void) | undefined];
