import Joi from 'joi';
import {Descriptor, descriptorSchema, IDescriptorSource} from './descriptor';
import {UnpackingError} from './unpacker';

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
     * @param tileTypeSource JSON data for tile type
     * @returns tileType -- Created TileType object
     */
    public static async fromSource(tileTypeSource: ITileTypeSource): Promise<TileType> {

        // Validate JSON data against schema
        try {
            await tileTypeSchema.validateAsync(tileTypeSource);
        } catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Create sub-objects
        let descriptor = await Descriptor.fromSource(tileTypeSource.descriptor);

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