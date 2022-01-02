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
     * Factory function to generate TileType from transportable JSON
     *
     * @param    tileTypeInfo JSON data for TileType
     * @returns               Created TileType object
     */
    public static async fromInfo(tileTypeInfo: ITileTypeInfo): Promise<TileType> {
        const descriptor = Descriptor.fromInfo(tileTypeInfo.descriptor);
        return new TileType(descriptor, tileTypeInfo.color, tileTypeInfo.traversable);
    }
}
