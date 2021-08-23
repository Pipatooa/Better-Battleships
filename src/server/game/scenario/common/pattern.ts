import Joi from 'joi';
import {ParsingContext} from '../parsing-context';
import {checkAgainstSchema} from '../schema-checker';
import {UnpackingError} from '../unpacker';
import {Rotation} from './rotation';

/**
 * Pattern - Server Version
 *
 * Defines a pattern of values about a center tile
 */
export class Pattern {

    protected readonly patternEntryMap: { [key: string]: number };

    /**
     * Pattern constructor
     * @param patternEntries
     * @param center Center of the pattern about which rotations happen
     */
    public constructor(protected readonly patternEntries: PatternEntry[],
                       protected readonly center: [number, number]) {

        this.patternEntryMap = {};

        for (const patternEntry of patternEntries) {
            let key: string = `${patternEntry.x},${patternEntry.y}`;
            this.patternEntryMap[key] = patternEntry.value;
        }
    }

    /**
     * Factory function to generate a rotated copy of this pattern
     * @param rotation Amount to rotate pattern by
     * @returns newPattern -- New Pattern object with all entries rotated about the center of the pattern
     */
    public rotated(rotation: Rotation): Pattern {
        let patternEntries: PatternEntry[] = this.patternEntries.map((patternEntry: PatternEntry) => {

            // Get dx and dy of pattern entry from pattern center
            let dx: number = patternEntry.x - this.center[0];
            let dy: number = patternEntry.y - this.center[1];

            let newDx: number;
            let newDy: number;

            // Perform rotation transforms
            switch (rotation) {
                case Rotation.NoChange:
                    newDx = dx;
                    newDy = dy;
                    break;
                case Rotation.Clockwise90:
                    newDx = dy;
                    newDy = -dx;
                    break;
                case Rotation.Clockwise180:
                    newDx = -dx;
                    newDy = -dy;
                    break;
                case Rotation.Clockwise270:
                    newDx = -dy;
                    newDy = dx;
                    break;
            }

            // Offset new dx and dy from pattern center
            let newX: number = newDx + this.center[0];
            let newY: number = newDy + this.center[1];

            return new PatternEntry(newX, newY, patternEntry.value);
        });

        return new Pattern(patternEntries, this.center);
    }

    /**
     * Queries the pattern to get a value at a location
     *
     * Queries outside the pattern will return 0 as a default value
     * @param x X coordinate of query position
     * @param y Y coordinate of query position
     * @returns value -- Value at position
     */
    public query(x: number, y: number): number {
        let key: string = `${x},${y}`;

        // If query position is not within the pattern
        if (!(key in this.patternEntryMap))
            return 0;

        // Return value at position
        return this.patternEntryMap[key];
    }

    /**
     * Calls a callback function for each entry within the pattern
     * @param callback Callback function to run on each entry
     */
    public forEachEntry(callback: (x: number, y: number, value: number) => void): void {
        for (const patternEntry of this.patternEntries) {
            callback(patternEntry.x, patternEntry.y, patternEntry.value);
        }
    }

    /**
     * Factory function to generate Pattern from JSON source data
     * @param parsingContext Context for resolving scenario data
     * @param patternSource JSON data for Pattern
     * @param checkSchema When true, validates source JSON data against schema
     * @returns pattern -- Created Pattern object
     */
    public static async fromSource(parsingContext: ParsingContext, patternSource: IPatternSource, checkSchema: boolean): Promise<Pattern> {

        // Validate JSON against schema
        if (checkSchema)
            patternSource = await checkAgainstSchema(patternSource, patternSchema, parsingContext);

        // Unpack value data
        let values: { [char: string]: number } = {};
        for (const entry of Object.entries(patternSource.values)) {
            let [char, value] = entry;
            values[char] = value;
        }

        // Ensure that the number of entries in 'pattern' matches the declared size of the pattern
        if (patternSource.pattern.length !== patternSource.size[1])
            throw new UnpackingError(`"${parsingContext.currentPathPrefix}pattern" must contain ${patternSource.size[1]} items to match "${parsingContext.currentPathPrefix}size[1]"`, parsingContext);

        // Calculate center of the pattern
        let centerX: number = (patternSource.size[0] - 1) / 2;
        let centerY: number = (patternSource.size[1] - 1) / 2;

        // Unpack pattern data
        let patternEntries: PatternEntry[] = [];
        for (let y = 0; y < patternSource.pattern.length; y++) {
            const row: string = patternSource.pattern[y];

            // Ensure that the number of patterns entries within a row matches the declared size of the board
            if (row.length !== patternSource.size[0])
                throw new UnpackingError(`"${parsingContext.currentPathPrefix}pattern[${y}]" length must be ${patternSource.size[0]} characters long to match "${parsingContext.currentPathPrefix}size[0]"`, parsingContext);

            // Iterate through each character, each representing a pattern entry
            for (let x = 0; x < patternSource.size[0]; x++) {
                let c: string = row.charAt(x);

                // If character did not match any value within the values map
                if (!(c in values))
                    throw new UnpackingError(`Could not find value for the character '${c}' in value map at '${parsingContext.currentPathPrefix}pattern[${y}][${x}]'`, parsingContext);

                // Get value for entry
                let value: number = values[c];

                // If entry has no value, do not store it in the pattern
                if (value === 0)
                    continue;

                // Create new entry and store in pattern entries
                patternEntries.push(new PatternEntry(x, y, value));
            }
        }

        // Return new created Pattern object
        return new Pattern(patternEntries, [centerX, centerY]);
    }
}

/**
 * PatternEntry - Server Version
 *
 * Single pattern entry with coordinate and value
 */
export class PatternEntry {
    public constructor(public readonly x: number,
                       public readonly y: number,
                       public readonly value: number) {
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IPatternSource {
    size: number[],
    values: { [char: string]: number },
    pattern: string[]
}

/**
 * Schema for validating source JSON data
 */
export const patternSchema = Joi.object({
    size: Joi.array().items(
        Joi.number().integer().min(1)
    ).length(2).required(),
    values: Joi.object().pattern(Joi.string().length(1), Joi.number()).min(1).required(),
    pattern: Joi.array().items(
        Joi.string().min(1)
    ).min(1).required()
});