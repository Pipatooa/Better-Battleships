import Joi from 'joi';

/**
 * TileGenerator - Server Version
 *
 * Not Yet Implemented
 */
export class TileGenerator {

    /**
     * Factory function to generate tile generator from JSON scenario data
     * @param tileGeneratorSource JSON data for tile generator
     * @returns tileGenerator -- Created TileGenerator object
     */
    public async fromSource(tileGeneratorSource: ITileGeneratorSource): Promise<TileGenerator> {
        return new TileGenerator();
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface ITileGeneratorSource {
}

/**
 * Schema for validating source JSON data
 */
export const tileGeneratorSchema = Joi.object();
