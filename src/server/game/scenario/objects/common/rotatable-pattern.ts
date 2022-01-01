import { Rotation }                   from 'shared/scenario/objects/common/rotation';
import { checkAgainstSchema }         from '../../schema-checker';
import { Pattern }                    from './pattern';
import { patternSchema }              from './sources/pattern';
import type { ParsingContext }        from '../../parsing-context';
import type { PatternEntry }          from './pattern';
import type { IPatternSource }        from './sources/pattern';
import type { IRotatablePatternInfo } from 'shared/network/scenario/i-rotatable-pattern-info';

/**
 * Rotatable Pattern - Server Version
 *
 * Defines a pattern of values about a center tile which can be rotated around a central point
 */
export class RotatablePattern extends Pattern {
    
    protected constructor(_patternEntries: PatternEntry[],
                          center: [number, number],
                          private readonly rotationalCenter: number) {
        super(_patternEntries, center);
    }
    
    /**
     * Factory function to generate RotatablePattern from JSON source data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    patternSource  JSON data for RotatablePattern
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created RotatablePattern object
     */
    public static async fromSource(parsingContext: ParsingContext, patternSource: IPatternSource, checkSchema: boolean): Promise<RotatablePattern> {

        // Validate JSON against schema
        if (checkSchema)
            patternSource = await checkAgainstSchema(patternSource, patternSchema, parsingContext);

        // Rotational center of the pattern
        const largeDimension = Math.max(...patternSource.size);
        const rotationalCenter = largeDimension / 2;

        // Where provided tile pattern fits within padded square pattern to allow for rotation
        const offsetX = Math.floor((largeDimension - patternSource.size[0]) / 2);
        const offsetY = Math.floor((largeDimension - patternSource.size[1]) / 2);

        // Tile center of the pattern
        const centerX: number = (patternSource.size[0] - 1) / 2 + offsetX;
        const centerY: number = (patternSource.size[1] - 1) / 2 + offsetY;

        const patternEntries = Pattern.getPatternEntriesFromSource(parsingContext, patternSource, [offsetX, offsetY]);

        // Return new created RotatablePattern object
        return new RotatablePattern(patternEntries, [ centerX, centerY ], rotationalCenter);
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
            const [newX, newY] = this.rotatePoint(x, y, rotation);
            patternEntries.push([newX, newY, v]);
        }

        const newCenter = this.rotatePoint(...this.center, rotation);
        return new RotatablePattern(patternEntries, newCenter, this.rotationalCenter);
    }

    /**
     * Rotates a point about the center of this pattern
     *
     * @param    x        X coordinate of point
     * @param    y        Y coordinate of point
     * @param    rotation Rotation to apply to point
     * @returns           Transformed point
     */
    protected rotatePoint(x: number, y: number, rotation: Rotation): [number, number] {

        // Get dx and dy of pattern entry from pattern center
        const dx = x - this.rotationalCenter;
        const dy = y - this.rotationalCenter;

        let newDx: number;
        let newDy: number;

        // Perform rotation transforms
        switch (rotation) {
            case Rotation.NoChange:
                newDx = dx;
                newDy = dy;
                break;
            case Rotation.Clockwise90:
                newDx = -dy;
                newDy = dx;
                break;
            case Rotation.Clockwise180:
                newDx = -dx;
                newDy = -dy;
                break;
            case Rotation.Clockwise270:
                newDx = dy;
                newDy = -dx;
                break;
            case Rotation.FullRotation:
                newDx = dx;
                newDy = dy;
                break;
        }

        // Offset new dx and dy from pattern center
        const newX = newDx + this.rotationalCenter;
        const newY = newDy + this.rotationalCenter;
        return [newX, newY];
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
     * Expands the pattern so that all cells within the radius of the pattern are included in a new pattern
     *
     * @param    radius Radius of cells around this pattern to include in new pattern
     * @returns         Created pattern
     */
    public getExtendedPattern(radius: number): RotatablePattern {
        const patternEntries = this.getExtendedPatternEntries(radius);
        return new RotatablePattern(patternEntries, this.center, this.rotationalCenter);
    }
}
