import type { IPatternInfo } from 'shared/network/scenario/i-pattern-info';

/**
 * Pattern - Client Version
 *
 * Defines a pattern of values about a center tile
 */
export class Pattern {

    protected readonly patternEntryMap: { [key: string]: number };
    public readonly bounds: [number, number, number, number];

    /**
     * Pattern constructor
     *
     * @param  _patternEntries Array of pattern entries for pattern
     * @param  center          Center of the pattern
     * @param  integerCenter   Center snapped to an integer coordinate
     * @param  patternEntryMap Optional pre-generated dictionary of positions to values
     */
    public constructor(protected readonly _patternEntries: PatternEntry[],
                       public readonly center: [number, number],
                       public readonly integerCenter: [number, number],
                       patternEntryMap?: { [key: string]: number }) {

        if (patternEntryMap !== undefined)
            this.patternEntryMap = patternEntryMap;
        else {
            this.patternEntryMap = {};
            for (const [x, y, value] of _patternEntries) {
                const key = `${x},${y}`;
                this.patternEntryMap[key] = value ?? 1;
            }
        }

        // Iterate through pattern entries and update bounds
        let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
        for (const [x, y] of this.patternEntries) {
            xMin = Math.min(xMin, x);
            xMax = Math.max(xMax, x);
            yMin = Math.min(yMin, y);
            yMax = Math.max(yMax, y);
        }
        this.bounds = [xMin, xMax, yMin, yMax];
    }

    /**
     * Factory function to generate Pattern from transportable JSON
     *
     * @param    patternInfo JSON data for Pattern
     * @returns              Created Pattern object
     */
    public static fromInfo(patternInfo: IPatternInfo): Pattern {
        return new Pattern(patternInfo.tiles as PatternEntry[], patternInfo.center, patternInfo.integerCenter);
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
        if (!this.query(x, y - 1))     flags |= BorderFlag.NY;
        if (!this.query(x + 1, y - 1)) flags |= BorderFlag.PXNY;
        if (!this.query(x - 1, y))     flags |= BorderFlag.NX;
        if (!this.query(x + 1, y))     flags |= BorderFlag.PX;
        if (!this.query(x - 1, y + 1)) flags |= BorderFlag.NXPY;
        if (!this.query(x, y + 1))     flags |= BorderFlag.PY;
        if (!this.query(x + 1, y + 1)) flags |= BorderFlag.PXPY;
        return flags;
    }

    /**
     * Expands the pattern so that all cells within the radius of the pattern are included in a new pattern
     *
     * @param    radius Radius of cells around this pattern to include in new pattern
     * @returns         Created pattern
     */
    public getExtendedPattern(radius: number): Pattern {
        const patternEntries = this.getExtendedPatternEntries(radius);
        return new Pattern(patternEntries, this.center, this.integerCenter);
    }

    /**
     * Creates an expanded array of pattern entries so that all cells within the radius of the pattern are included
     *
     * @param    radius Radius of cells around this pattern to include in new pattern entry list
     * @returns         Expanded array of pattern entries
     */
    protected getExtendedPatternEntries(radius: number): PatternEntry[] {
        const patternEntryMap: { [char: string]: number } = {};
        for (const [x, y] of this.patternEntries) {
            for (let dx = -radius; dx <= radius; dx++) {
                const subRadius = radius - Math.abs(dx);
                for (let dy = -subRadius; dy <= subRadius; dy++) {
                    const key = `${x + dx},${y + dy}`;
                    patternEntryMap[key] = 1;
                }
            }
        }

        const patternEntries: PatternEntry[] = [];
        for (const key of Object.keys(patternEntryMap)) {
            const [x, y] = key.split(',');
            patternEntries.push([parseInt(x), parseInt(y), 1]);
        }

        return patternEntries;
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
