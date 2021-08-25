import {ITileTypeInfo} from '../../../shared/network/scenario/i-tiletype-info';
import {Descriptor} from './descriptor';


/**
 * TileType - Client Version
 *
 * Stores a descriptor and a color for a tile
 */
export class TileType {
    public constructor(public readonly descriptor: Descriptor,
                       public readonly color: string) {
    }

    /**
     * Factory function to generate tile type from JSON event data
     * @param tileTypeSource JSON data from server
     * @returns tileType -- Created TileType object
     */
    public static async fromSource(tileTypeSource: ITileTypeInfo): Promise<TileType> {

        // Create sub-objects
        let descriptor = await Descriptor.fromSource(tileTypeSource.descriptor);

        // Return tile type object
        return new TileType(descriptor, tileTypeSource.color);
    }
}