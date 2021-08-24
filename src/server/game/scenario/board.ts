import Joi from 'joi';
import {IBoardInfo} from '../../../shared/network/scenario/i-board-info';
import {ITileTypeInfo} from '../../../shared/network/scenario/i-tiletype-info';
import {genericNameSchema} from './common/generic-name';
import {ParsingContext} from './parsing-context';
import {checkAgainstSchema} from './schema-checker';
import {Tile} from './tile';
import {TileGenerator, tileGeneratorSchema} from './tile-generator';
import {TileType, tileTypeSchema} from './tiletype';
import {UnpackingError} from './unpacker';

/**
 * Board - Server Version
 *
 * Stores all information about the tiles of the board and objects on the board
 */
export class Board {

    protected readonly _size: [number, number];

    /**
     * Board constructor
     * @param tiles 2d array of tiles
     * @param generators List of tile generators
     */
    public constructor(public readonly tiles: Tile[][],
                       public readonly generators: TileGenerator[]) {

        this._size = [tiles[0].length, tiles.length];
    }

    /**
     * Factory function to generate Board from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param boardSource JSON data from 'board.json'
     * @param checkSchema When true, validates source JSON data against schema
     * @returns board -- Created Board object
     */
    public static async fromSource(parsingContext: ParsingContext, boardSource: IBoardSource, checkSchema: boolean): Promise<Board> {

        // Validate JSON against schema
        if (checkSchema)
            boardSource = await checkAgainstSchema(boardSource, boardSchema, parsingContext);

        // Unpack palette data
        let palette: { [char: string]: TileType } = {};
        for (const entry of Object.entries(boardSource.palette)) {

            // Create new TileType objects indexed by single character strings
            let [char, tileTypeSource] = entry;
            palette[char] = await TileType.fromSource(parsingContext.withExtendedPath(`.palette.${char}`), tileTypeSource, false, char);
        }

        // Ensure that the number of entries in 'tiles' matches the declared size of the board
        if (boardSource.tiles.length !== boardSource.size[1])
            throw new UnpackingError(`"${parsingContext.currentPathPrefix}tiles" must contain ${boardSource.size[1]} items to match "${parsingContext.currentPathPrefix}size[1]"`, parsingContext);

        // Unpack tile data
        let tiles: Tile[][] = [];
        for (let y = 0; y < boardSource.tiles.length; y++) {
            const row: string = boardSource.tiles[y];

            // Ensure that the number of tiles within a row matches the declared size of the board
            if (row.length !== boardSource.size[0])
                throw new UnpackingError(`"${parsingContext.currentPathPrefix}tiles[${y}]" length must be ${boardSource.size[0]} characters long to match "${parsingContext.currentPathPrefix}size[0]"`, parsingContext);

            // Create new tile row
            tiles[y] = [];

            // Iterate through each character, each representing a tile
            for (let x = 0; x < boardSource.size[0]; x++) {
                let c: string = row.charAt(x);

                // If character did not match any tile type within the palette
                if (!(c in palette))
                    throw new UnpackingError(`Could not find tile of type '${c}' defined at '${parsingContext.currentPathPrefix}tiles[${y}][${x}]' within the palette defined at '${parsingContext.currentPathPrefix}palette'`, parsingContext);

                // Create and store new tile created from tile type
                // Tiles are stored in tile[y][x] format
                let tileType: TileType = palette[c];
                tiles[y][x] = new Tile(x, y, tileType);
            }
        }

        // Return created Board object
        return new Board(tiles, []);
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     */
    public makeTransportable(): IBoardInfo {

        // Convert tiles to compact string representation
        let tileInfo: string[] = [];
        let tileTypeInfo: { [char: string]: ITileTypeInfo } = {};

        for (let y = 0; y < this.size[1]; y++) {
            tileInfo[y] = '';
            for (let x = 0; x < this.size[0]; x++) {

                // Get tile at position
                let tile = this.tiles[y][x];
                let tileTypeChar = tile.tileType.char;

                // Add tile to compact string format
                tileInfo[y] += tileTypeChar;

                // If character for tile has not been recorded
                if (!(tileTypeChar in tileTypeInfo))
                    tileTypeInfo[tileTypeChar] = tile.tileType.makeTransportable();
            }
        }

        return {
            size: this._size,
            tileTypes: tileTypeInfo,
            tiles: tileInfo
        };
    }

    /**
     * Getters and setters
     */

    public get size(): [number, number] {
        return this._size;
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IBoardSource {
    size: [x: number, y: number];
    palette: { [char: string]: TileType },
    tiles: string[],
    generators: TileGenerator[]
}

/**
 * Schema for validating source JSON data
 */
export const boardSchema = Joi.object({
    size: Joi.array().items(
        Joi.number().integer().min(5)
    ).length(2).required(),
    palette: Joi.object().pattern(Joi.string().length(1), tileTypeSchema).required(),
    regionPalette: Joi.object().pattern(Joi.string().length(1), Joi.array().items(genericNameSchema)).required(),
    tiles: Joi.array().items(
        Joi.string().min(5)
    ).min(5).required(),
    regions: Joi.array().items(
        Joi.string().min(5)
    ).min(5).required(),
    generators: Joi.array().items(tileGeneratorSchema).required()
});