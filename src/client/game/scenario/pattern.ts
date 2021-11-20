import type { IPatternInfo } from '../../../shared/network/scenario/i-pattern-info';

/**
 * Pattern - Client Version
 *
 * Defines a pattern of values about a center tile
 */
export class Pattern {

    protected readonly patternEntryMap: { [key: string]: number };

    /**
     * Pattern constructor
     *
     * @param  _patternEntries List of pattern entries for pattern
     * @param  center          Center of the pattern about which rotations happen
     */
    public constructor(protected readonly _patternEntries: PatternEntry[],
                       public readonly center: [number, number]) {

        this.patternEntryMap = {};
        for (const [x, y, value] of _patternEntries) {
            const key = `${x},${y}`;
            this.patternEntryMap[key] = value ?? 1;
        }
    }

    /**
     * Factory function to generate Pattern from transportable JSON
     *
     * @param    patternInfo JSON data for Pattern
     * @returns              Created Pattern object
     */
    public static fromSource(patternInfo: IPatternInfo): Pattern {
        return new Pattern(patternInfo.tiles as PatternEntry[], patternInfo.center);
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
        for (const [x, y] of this.patternEntries) {
            xMax = Math.max(xMax, x);
            yMax = Math.max(yMax, y);
        }
        
        return [xMax, yMax];
    }

    /**
     * Queries the pattern to get a value at a location
     *
     * Queries outside the pattern will return 0 as a default value
     *
     * @param    x X coordinate of query position
     * @param    y Y coordinate of query position
     * @returns    Value at position
     */
    public query(x: number, y: number): number {
        const key = `${x},${y}`;
        return this.patternEntryMap[key] ?? 0;
    }

    /**
     * Generates a number composing border flags describing which neighbours of the pattern are present.
     *
     * Neighbour results are inverted. Border flag present if neighbour is not present.
     *
     * @param    x X coordinate of query position
     * @param    y Y coordinate of query position
     * @returns    Number composing border flags
     */
    public getBorderFlags(x: number, y: number): number {
        let flags = 0;
        if (!this.query(x - 1, y - 1)) flags |= BorderFlag.NXNY;
        if (!this.query(x, y - 1)) flags |= BorderFlag.NY;
        if (!this.query(x + 1, y - 1)) flags |= BorderFlag.PXNY;
        if (!this.query(x - 1, y)) flags |= BorderFlag.NX;
        if (!this.query(x + 1, y)) flags |= BorderFlag.PX;
        if (!this.query(x - 1, y + 1)) flags |= BorderFlag.NXPY;
        if (!this.query(x, y + 1)) flags |= BorderFlag.PY;
        if (!this.query(x + 1, y + 1)) flags |= BorderFlag.PXPY;
        return flags;
    }

    /**
     * Getters and setters
     */

    public get patternEntries(): PatternEntry[] {
        return this._patternEntries;
    }
}

export type PatternEntry = [number, number, number | undefined];

enum BorderFlag {
    NXNY = 1,
    NY = 2,
    PXNY = 4,
    NX = 8,
    PX = 16,
    NXPY = 32,
    PY = 64,
    PXPY = 128
}
