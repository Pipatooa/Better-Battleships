import type { ITileTypeInfo } from './i-tiletype-info';

/**
 * Portable network version of Board object
 */
export interface IBoardInfo {
    size: [number, number],
    tileTypes: { [char: string]: ITileTypeInfo },
    tiles: string[]
}
