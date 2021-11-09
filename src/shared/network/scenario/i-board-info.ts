import type { ITileTypeInfo } from './i-tiletype-info';

/**
 * Portable network version of Board object
 */
export interface IBoardInfo {
    size: [number, number],
    tilePalette: { [char: string]: ITileTypeInfo },
    regionPalette: { [char: string]: string[] }
    tiles: string[],
    regions: string[]
}
