import type { IAttributeInfo }     from './i-attribute-info';
import type { IShipPrototypeInfo } from './i-ship-prototype-info';

/**
 * Portable network version of Player object
 */
export interface IPlayerInfo {
    ships: [string, IShipPrototypeInfo][],
    spawnRegion: string,
    attributes: { [name: string]: IAttributeInfo }
}
