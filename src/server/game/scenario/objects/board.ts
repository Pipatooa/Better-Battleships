import { CharacterMapGenerator } from 'shared/character-map-generator';
import { arraysEqual }           from 'shared/utility';
import { checkAgainstSchema }    from '../schema-checker';
import { UnpackingError }        from '../unpacker';
import { Region }                from './region';
import { boardSchema }           from './sources/board';
import { TileType }              from './tiletype';
import type { Rotation }         from '../../../../shared/scenario/objects/common/rotation';
import type { ParsingContext }   from '../parsing-context';
import type { Ship }             from './ship';
import type { IBoardSource }     from './sources/board';
import type { TileGenerator }    from './tile-generator';
import type { IBoardInfo }       from 'shared/network/scenario/i-board-info';
import type { ITileTypeInfo }    from 'shared/network/scenario/i-tiletype-info';

/**
 * Board - Server Version
 *
 * Stores all information about the tiles of the board and objects on the board
 */
export class Board {

    public readonly size: [number, number];

    /**
     * Board constructor
     *
     * @param  tiles      2d array of tiles indexed [y][x]
     * @param  regions    Dictionary of regions indexed by ID
     * @param  generators List of tile generators
     */
    public constructor(public readonly tiles: Tile[][],
                       public readonly regions: { [id: string]: Region },
                       public readonly generators: TileGenerator[]) {

        this.size = [ tiles[0].length, tiles.length ];
    }

    /**
     * Factory function to generate Board from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    boardSource    JSON data from 'board.json'
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Board object
     */
    public static async fromSource(parsingContext: ParsingContext, boardSource: IBoardSource, checkSchema: boolean): Promise<Board> {

        // Validate JSON against schema
        if (checkSchema)
            boardSource = await checkAgainstSchema(boardSource, boardSchema, parsingContext);

        // Unpack palette data
        const palette: { [char: string]: TileType } = {};
        for (const [char, tileTypeSource] of Object.entries(boardSource.tilePalette)) {
            palette[char] = await TileType.fromSource(parsingContext.withExtendedPath(`.palette.${char}`), tileTypeSource, false);
            parsingContext.reducePath();
        }

        // Unpack region palette data
        const regions: { [id: string]: Region } = {};
        const regionPalette: { [char: string]: string[] } = boardSource.regionPalette;
        for (const regionIDs of Object.values(regionPalette)) {
            for (const regionID of regionIDs) {
                if (regions[regionID] === undefined)
                    regions[regionID] = new Region(regionID);
            }
        }

        // Ensure that the number of entries in 'tiles' matches the declared size of the board
        if (boardSource.tiles.length !== boardSource.size[1])
            throw new UnpackingError(`"${parsingContext.currentPathPrefix}tiles" must contain ${boardSource.size[1]} items to match "${parsingContext.currentPathPrefix}size[1]. Found ${boardSource.tiles.length}"`, parsingContext);
        if (boardSource.regions.length !== boardSource.size[1])
            throw new UnpackingError(`"${parsingContext.currentPathPrefix}regions" must contain ${boardSource.size[1]} items to match "${parsingContext.currentPathPrefix}size[1]. Found ${boardSource.regions.length}"`, parsingContext);

        // Unpack tile and region data
        const tiles: Tile[][] = [];
        for (let y = 0; y < boardSource.tiles.length; y++) {
            const tileRow: string = boardSource.tiles[y];
            const regionRow: string = boardSource.regions[y];

            // Ensure that the number of tiles within a row matches the declared size of the board
            if (tileRow.length !== boardSource.size[0])
                throw new UnpackingError(`"${parsingContext.currentPathPrefix}tiles[${y}]" length must be ${boardSource.size[0]} characters long to match "${parsingContext.currentPathPrefix}size[0]. Found ${tileRow.length}"`, parsingContext);
            if (regionRow.length !== boardSource.size[0])
                throw new UnpackingError(`"${parsingContext.currentPathPrefix}regions[${y}]" length must be ${boardSource.size[0]} characters long to match "${parsingContext.currentPathPrefix}size[0]. Found ${regionRow.length}"`, parsingContext);

            // Create new tile row
            tiles[y] = [];

            // Iterate through each character, each representing a tile
            for (let x = 0; x < boardSource.size[0]; x++) {
                const tileChar: string = tileRow.charAt(x);
                const regionChar: string = regionRow.charAt(x);

                // If character did not match any tile type within the palette
                if (!(tileChar in palette))
                    throw new UnpackingError(`Could not find tile of type '${tileChar}' defined at '${parsingContext.currentPathPrefix}tiles[${y}][${x}]' within the palette defined at '${parsingContext.currentPathPrefix}palette'`, parsingContext);
                if (!(regionChar in regionPalette))
                    throw new UnpackingError(`Could not find regions matching '${regionChar}' defined at '${parsingContext.currentPathPrefix}regions[${y}][${x}]' within the palette defined at '${parsingContext.currentPathPrefix}regionPalette'`, parsingContext);

                const tileType: TileType = palette[tileChar];
                const tileRegions: Region[] = [];
                for (const regionID of regionPalette[regionChar])
                    tileRegions.push(regions[regionID]);
                tiles[y][x] = [tileType, tileRegions, undefined];
            }
        }

        // Return created Board object
        return new Board(tiles, regions, []);
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created IBoardInfo object
     */
    public makeTransportable(): IBoardInfo {

        // Create a set of character map generators to convert tile and region grid to string representation
        const tiles: string[] = [];
        const regions: string[] = [];
        const tileTypeMapGenerator = new CharacterMapGenerator<TileType>();
        const regionMapGenerator = new CharacterMapGenerator<Region[]>(arraysEqual);

        // Generate character strings
        for (const tileRow of this.tiles) {
            const rowTileTypes: TileType[] = [];
            const rowRegions: Region[][] = [];
            for (const tile of tileRow) {
                rowTileTypes.push(tile[0]);
                rowRegions.push(tile[1]);
            }

            tiles.push(tileTypeMapGenerator.getString(rowTileTypes));
            regions.push(regionMapGenerator.getString(rowRegions));
        }

        // Export palette info
        const tilePalette: { [char: string]: ITileTypeInfo } = {};
        for (const [char, tileType] of Object.entries(tileTypeMapGenerator.exportMap())) {
            tilePalette[char] = tileType.makeTransportable();
        }

        const regionPalette: { [char: string]: string[] } = {};
        for (const [char, region] of Object.entries(regionMapGenerator.exportMap())) {
            regionPalette[char] = region.map(r => r.id);
        }

        return {
            size: this.size,
            tilePalette: tilePalette,
            regionPalette: regionPalette,
            tiles: tiles,
            regions: regions
        };
    }

    /**
     * Adds a ship to the board
     *
     * @param  ship Ship to add to the board
     */
    public addShip(ship: Ship): void {
        for (const [dx, dy] of ship.pattern.patternEntries) {
            const x = ship.x + dx;
            const y = ship.y + dy;
            const tile = this.tiles[y][x];
            tile[2] = ship;
        }
    }

    /**
     * Removes a ship from the board
     *
     * @param  ship Ship to remove the board
     */
    public removeShip(ship: Ship): void {
        for (const [dx, dy] of ship.pattern.patternEntries) {
            const x = ship.x + dx;
            const y = ship.y + dy;
            const tile = this.tiles[y][x];
            tile[2] = undefined;
        }
    }

    /**
     * Checks whether a ship can be placed on this board at a particular location
     *
     * @param    ship        Ship to place
     * @param    rotation    Rotation of ship
     * @param    x           X coordinate of placement
     * @param    y           Y coordinate of placement
     * @param    validRegion Region within which the ship's placement is valid
     * @returns              Whether or not the ship can be placed at that location
     */
    public checkPlacement(ship: Ship, rotation: Rotation, x: number, y: number, validRegion: Region): boolean {
        const pattern = ship.pattern.rotated(rotation);
        for (const [dx, dy] of pattern.patternEntries) {
            const tile = this.tiles[y + dy]?.[x + dx];
            if (!tile?.[1].includes(validRegion))
                return false;
            if (tile[2] !== undefined)
                return false;
        }
        return true;
    }

    /**
     * Checks whether a ship can perform a rotation successfully
     *
     * @param    ship     Ship to rotate
     * @param    rotation Rotation to apply
     * @returns           Whether or not ship can be rotated
     */
    public checkRotation(ship: Ship, rotation: Rotation): boolean {
        const rotatedPattern = ship.pattern.rotated(rotation);
        for (const [dx, dy] of rotatedPattern.patternEntries) {
            const tile = this.tiles[ship.y + dy]?.[ship.x + dx];
            if (!tile[0]?.traversable)
                return false;
            if (tile[2] !== undefined && tile[2] !== ship)
                return false;
        }
        return true;
    }
}

/**
 * Type describing an entry for a single tile
 */
export type Tile = [TileType, Region[], Ship | undefined];
