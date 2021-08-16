import Joi from 'joi';
import {Descriptor, descriptorSchema, IDescriptorSource} from './common/descriptor';
import {ParsingContext} from './parsing-context';
import {checkAgainstSchema} from './schema-checker';

/**
 * TileType - Server Version
 *
 * Stores a descriptor and a color for a tile
 */
export class TileType {
    public constructor(public readonly descriptor: Descriptor,
                       public readonly color: string) {
    }

    /**
     * Factory function to generate tile type from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param tileTypeSource JSON data for tile type
     * @param checkSchema When true, validates source JSON data against schema
     * @returns tileType -- Created TileType object
     */
    public static async fromSource(parsingContext: ParsingContext, tileTypeSource: ITileTypeSource, checkSchema: boolean): Promise<TileType> {

        // Validate JSON data against schema
        if (checkSchema)
            tileTypeSource = await checkAgainstSchema(tileTypeSource, tileTypeSchema, parsingContext);

        // Create sub-objects
        let descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), tileTypeSource.descriptor, false);

        // Return tile type object
        return new TileType(descriptor, tileTypeSource.color);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface ITileTypeSource {
    descriptor: IDescriptorSource,
    color: string
}

/**
 * Schema for validating source JSON data
 */
export const tileTypeSchema = Joi.object({
    descriptor: descriptorSchema.required(),
    color: Joi.string().regex(/#[0-9a-fA-F]{6}/).required()
});