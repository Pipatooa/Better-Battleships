import { Descriptor }         from './descriptor';
import type { ITileTypeInfo } from 'shared/network/scenario/i-tiletype-info';


/**
 * TileType - Client Version
 *
 * Stores a descriptor and a color for a tile
 */
export class TileType {

    public colorPaletteIndex: number | undefined;

    public constructor(public readonly descriptor: Descriptor,
                       public readonly color: string,
                       public readonly traversable: boolean) {
    }

    /**
     * Factory function to generate tile type from JSON event data
     *
     * @param    tileTypeSource JSON data from server
     * @returns                 Created TileType object
     */
    public static async fromSource(tileTypeSource: ITileTypeInfo): Promise<TileType> {

        // Create sub-objects
        const descriptor = Descriptor.fromSource(tileTypeSource.descriptor);

        // Return tile type object
        return new TileType(descriptor, tileTypeSource.color, tileTypeSource.traversable);
    }
}
