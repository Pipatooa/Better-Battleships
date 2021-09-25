/**
 * Portable network version of Pattern object
 */
export interface IPatternInfo {
    center: [number, number],
    tiles: [number, number, number][] | [number, number][];
}