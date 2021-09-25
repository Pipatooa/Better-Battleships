import { IPatternInfo } from '../../../shared/network/scenario/i-pattern-info';

/**
 * Pattern - Client Version
 *
 * Defines a pattern of values about a center tile
 */
export class Pattern {

    /**
     * Pattern constructor
     *
     * @param  _patternEntries List of pattern entries for pattern
     * @param  center          Center of the pattern about which rotations happen
     */
    public constructor(protected readonly _patternEntries: PatternEntry[],
                       protected readonly center: [number, number]) {
    }

    /**
     * Factory function to generate Pattern from transportable JSON
     *
     * @param    patternInfo JSON data for Pattern
     * @returns              Created Pattern object
     */
    public static fromSource(patternInfo: IPatternInfo): Pattern {

        // Unpack pattern entries
        let patternEntries: PatternEntry[] = [];
        for (const [x, y, v] of patternInfo.tiles) {
            patternEntries.push(new PatternEntry(x, y, v));
        }

        // Return new created Pattern object
        return new Pattern(patternEntries, patternInfo.center);
    }

    /**
     * Returns the bounding coordinates for the pattern
     *
     * @returns  [xMax, yMax] Bounding coordinates
     */
    public getBounds(): [number, number] {
        let xMax = 0;
        let yMax = 0;

        // Iterate through pattern entries and update bounds
        for (const pattenEntry of this.patternEntries) {
            xMax = Math.max(xMax, pattenEntry.x);
            yMax = Math.max(yMax, pattenEntry.y);
        }
        
        return [xMax, yMax];
    }

    /**
     * Getters and setters
     */

    public get patternEntries(): PatternEntry[] {
        return this._patternEntries;
    }
}

/**
 * PatternEntry - Client Version
 *
 * Single pattern entry with coordinate and value
 */
export class PatternEntry {
    public constructor(public readonly x: number,
                       public readonly y: number,
                       public readonly value?: number) {
    }
}