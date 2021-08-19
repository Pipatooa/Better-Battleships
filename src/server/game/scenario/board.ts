import Joi from 'joi';
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
    public constructor(public readonly tiles: Tile[][],
                       public readonly generators: TileGenerator[]) {
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
            palette[char] = await TileType.fromSource(parsingContext.withExtendedPath(`.palette.${char}`), tileTypeSource, false);
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

            // Iterate through each character, each representing a tile
            for (let x = 0; x < boardSource.size[0]; x++) {
                let c: string = row.charAt(x);

                // If character did not match any tile type within the palette
                if (!(c in palette))
                    throw new UnpackingError(`Could not find tile of type '${c}' defined at '${parsingContext.currentPathPrefix}tiles[${y}][${x}]' within the palette defined at '${parsingContext.currentPathPrefix}palette'`, parsingContext);

                // Create and store new tile created from tile type
                let tileType: TileType = palette[c];
                let tile = new Tile(x, y, tileType);
                if (y === 0)
                    tiles[x] = [];
                tiles[x][y] = tile;
            }
        }

        // Return created Board object
        return new Board(tiles, []);
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