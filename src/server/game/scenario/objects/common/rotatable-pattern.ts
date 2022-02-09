import { rotatePoint }                from 'shared/scenario/rotation';
import { checkAgainstSchema }         from '../../schema-checker';
import { Pattern }                    from './pattern';
import { patternSchema }              from './sources/pattern';
import type { ParsingContext }        from '../../parsing-context';
import type { PatternEntry }          from './pattern';
import type { IPatternSource }        from './sources/pattern';
import type { IRotatablePatternInfo } from 'shared/network/scenario/i-rotatable-pattern-info';
import type { Rotation }              from 'shared/scenario/rotation';

/**
 * RotatablePattern - Server Version
 *
 * Defines a pattern of values about a center tile which can be rotated around a central point
 */
export class RotatablePattern extends Pattern {

    /**
     * RotatablePattern constructor
     *
     * @param  _patternEntries  Array of pattern entries for pattern
     * @param  center           Center of the pattern
     * @param  integerCenter    Center snapped to an integer coordinate
     * @param  rotationalCenter Point about which the pattern rotates
     */
    public constructor(_patternEntries: PatternEntry[],
                       center: [number, number],
                       integerCenter: [number, number] | undefined,
                       public readonly rotationalCenter: [number, number]) {
        super(_patternEntries, center, integerCenter);
    }
    
    /**
     * Factory function to generate RotatablePattern from JSON source data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    patternSource  JSON data for RotatablePattern
     * @param    booleanise     Whether to convert pattern values to boolean values
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created RotatablePattern object
     */
    public static async fromSource(parsingContext: ParsingContext, patternSource: IPatternSource, booleanise: boolean, checkSchema: boolean): Promise<RotatablePattern> {

        // Validate JSON against schema
        if (checkSchema)
            patternSource = await checkAgainstSchema(patternSource, patternSchema, parsingContext);

        // Rotational center of the pattern
        const largeDimension = Math.max(...patternSource.size);
        const rotationalCenter = (largeDimension - 1) / 2;

        // Where provided tile pattern fits within padded square pattern to allow for rotation
        const offsetX = Math.floor((largeDimension - patternSource.size[0]) / 2);
        const offsetY = Math.floor((largeDimension - patternSource.size[1]) / 2);

        // Tile center of the pattern
        const centerX: number = (patternSource.size[0] - 1) / 2 + offsetX;
        const centerY: number = (patternSource.size[1] - 1) / 2 + offsetY;

        const patternEntries = Pattern.getPatternEntriesFromSource(parsingContext, patternSource, booleanise, [offsetX, offsetY]);

        // Return new created RotatablePattern object
        return new RotatablePattern(patternEntries, [centerX, centerY], undefined, [rotationalCenter, rotationalCenter]);
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @param    includeValue Whether to include the value for each pattern entry
     * @returns               Created IRotatablePatternInfo object
     */
    public makeTransportable(includeValue: boolean): IRotatablePatternInfo {
        return {
            ...super.makeTransportable(includeValue),
            rotationCenter: this.rotationalCenter
        };
    }

    /**
     * Factory function to generate a rotated copy of this pattern
     *
     * @param    rotation Amount to rotate pattern by
     * @returns           New RotatablePattern object with all entries rotated about the center of the pattern
     */
    public rotated(rotation: Rotation): RotatablePattern {
        const patternEntries: PatternEntry[] = [];
        for (const [x, y, v] of this._patternEntries ){
            const [newX, newY] = rotatePoint([x, y], this.rotationalCenter, rotation);
            patternEntries.push([newX, newY, v]);
        }

        const newCenter = rotatePoint(this.center, this.rotationalCenter, rotation);
        const newIntegerCenter = rotatePoint(this.integerCenter, this.rotationalCenter, rotation);
        return new RotatablePattern(patternEntries, newCenter, newIntegerCenter, this.rotationalCenter);
    }

    /**
     * Expands the pattern so that all cells within the radius of the pattern are included in a new pattern
     *
     * @param    radius Radius of cells around this pattern to include in new pattern
     * @returns         Created pattern
     */
    public getExtendedPattern(radius: number): RotatablePattern {
        const patternEntries = this.getExtendedPatternEntries(radius);
        return new RotatablePattern(patternEntries, this.center, undefined, this.rotationalCenter);
    }
}
