import { checkAgainstSchema }  from '../../schema-checker';
import { UnpackingError }      from '../../unpacker';
import { patternSchema }       from './sources/pattern';
import type { ParsingContext } from '../../parsing-context';
import type { IPatternSource } from './sources/pattern';
import type { IPatternInfo }   from 'shared/network/scenario/i-pattern-info';

/**
 * Pattern - Server Version
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
    protected constructor(protected readonly _patternEntries: PatternEntry[],
                          public readonly center: [number, number]) {

        this.patternEntryMap = {};
        for (const [x, y, value] of _patternEntries) {
            const key = `${x},${y}`;
            this.patternEntryMap[key] = value;
        }
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
     * Factory function to generate Pattern from JSON source data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    patternSource  JSON data for Pattern
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Pattern object
     */
    public static async fromSource(parsingContext: ParsingContext, patternSource: IPatternSource, checkSchema: boolean): Promise<Pattern> {

        // Validate JSON against schema
        if (checkSchema)
            patternSource = await checkAgainstSchema(patternSource, patternSchema, parsingContext);

        // Calculate center of the pattern
        const centerX: number = (patternSource.size[0] - 1) / 2;
        const centerY: number = (patternSource.size[1] - 1) / 2;
        const patternEntries = Pattern.getPatternEntriesFromSource(parsingContext, patternSource, [0, 0]);

        // Return new created Pattern object
        return new Pattern(patternEntries, [ centerX, centerY ]);
    }

    /**
     * Retrieves a set of pattern entries from JSON source data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    patternSource  JSON data for Pattern
     * @param    offset         Amount to offset all tile positions within defined pattern
     * @returns                 Array of pattern entries
     */
    protected static getPatternEntriesFromSource(parsingContext: ParsingContext, patternSource: IPatternSource, offset: [number, number]): PatternEntry[] {

        // Unpack value data
        const values: { [char: string]: number } = {};
        for (const entry of Object.entries(patternSource.values)) {
            const [ char, value ] = entry;
            values[char] = value;
        }

        // Ensure that the number of entries in 'pattern' matches the declared size of the pattern
        if (patternSource.pattern.length !== patternSource.size[1])
            throw new UnpackingError(`"${parsingContext.currentPathPrefix}pattern" must contain ${patternSource.size[1]} items to match "${parsingContext.currentPathPrefix}size[1]"`, parsingContext);

        // Unpack pattern data
        const patternEntries: PatternEntry[] = [];
        for (let y = 0; y < patternSource.pattern.length; y++) {
            const row: string = patternSource.pattern[y];

            // Ensure that the number of patterns entries within a row matches the declared size of the board
            if (row.length !== patternSource.size[0])
                throw new UnpackingError(`"${parsingContext.currentPathPrefix}pattern[${y}]" length must be ${patternSource.size[0]} characters long to match "${parsingContext.currentPathPrefix}size[0]"`, parsingContext);

            // Iterate through each character, each representing a pattern entry
            for (let x = 0; x < patternSource.size[0]; x++) {
                const c: string = row.charAt(x);

                // If character did not match any value within the values map
                if (!(c in values))
                    throw new UnpackingError(`Could not find value for the character '${c}' in value map at '${parsingContext.currentPathPrefix}pattern[${y}][${x}]'`, parsingContext);

                // Get value for entry
                const value: number = values[c];

                // If entry has no value, do not store it in the pattern
                if (value === 0)
                    continue;

                // Create new entry and store in pattern entries
                patternEntries.push([x + offset[0], y + offset[1], value]);
            }
        }

        return patternEntries;
    }

    /**
     * Expands the pattern so that all cells within the radius of the pattern are included in a new pattern
     *
     * @param    radius Radius of cells around this pattern to include in new pattern
     * @returns         Created pattern
     */
    public getExtendedPattern(radius: number): Pattern {
        const patternEntries = this.getExtendedPatternEntries(radius);
        return new Pattern(patternEntries, this.center);
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
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @param    includeValue Whether or not to include the value for each pattern entry
     * @returns               Created IPatternInfo object
     */
    public makeTransportable(includeValue: boolean): IPatternInfo {

        // Convert pattern entries to list of number entries
        const tiles: [number, number, number][] | [number, number][] = [];
        for (const [x, y, value] of this._patternEntries) {
            if (includeValue)
                (tiles as [number, number, number][]).push([x, y, value]);
            else
                (tiles as [number, number][]).push([ x, y ]);
        }

        return {
            center: this.center,
            tiles: tiles
        };
    }

    /**
     * Getters and setters
     */

    public get patternEntries(): PatternEntry[] {
        return this._patternEntries;
    }
}

export type PatternEntry = [x: number, y: number, value: number];
