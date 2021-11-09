import type { ITileTypeInfo } from '../../../../shared/network/scenario/i-tiletype-info';
import type { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { Descriptor } from './common/descriptor';
import type { ITileTypeSource } from './sources/tile-type';
import { tileTypeSchema } from './sources/tile-type';

/**
 * TileType - Server Version
 *
 * Stores a descriptor and a color for a tile
 */
export class TileType {
    public constructor(public readonly descriptor: Descriptor,
                       public readonly color: string,
                       public readonly traversable: boolean) {
    }

    /**
     * Factory function to generate tile type from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    tileTypeSource JSON data for tile type
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created TileType object
     */
    public static async fromSource(parsingContext: ParsingContext, tileTypeSource: ITileTypeSource, checkSchema: boolean): Promise<TileType> {

        // Validate JSON data against schema
        if (checkSchema)
            tileTypeSource = await checkAgainstSchema(tileTypeSource, tileTypeSchema, parsingContext);

        // Create sub-objects
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), tileTypeSource.descriptor, false);

        // Return tile type object
        return new TileType(descriptor, tileTypeSource.color, tileTypeSource.traversable);
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created ITileTypeInfo object
     */
    public makeTransportable(): ITileTypeInfo {
        return {
            descriptor: this.descriptor.makeTransportable(),
            color: this.color,
            traversable: this.traversable
        };
    }
}
