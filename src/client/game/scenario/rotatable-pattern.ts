import { rotatePoint }                from 'shared/scenario/rotation';
import { Pattern }                    from './pattern';
import type { PatternEntry }          from './pattern';
import type { IRotatablePatternInfo } from 'shared/network/scenario/i-rotatable-pattern-info';
import type { Rotation }              from 'shared/scenario/rotation';

/**
 * RotatablePattern - Client Version
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
    protected constructor(_patternEntries: PatternEntry[],
                          center: [number, number],
                          integerCenter: [number, number],
                          public readonly rotationalCenter: [number, number]) {
        super(_patternEntries, center, integerCenter);
    }

    /**
     * Factory function to generate RotatablePattern from transportable JSON
     *
     * @param    rotatablePatternInfo JSON data for Pattern
     * @returns                       Created Pattern object
     */
    public static fromInfo(rotatablePatternInfo: IRotatablePatternInfo): RotatablePattern {
        return new RotatablePattern(rotatablePatternInfo.tiles as PatternEntry[], rotatablePatternInfo.center, rotatablePatternInfo.integerCenter, rotatablePatternInfo.rotationCenter);
    }

    /**
     * Factory function to generate a rotated copy of this pattern
     *
     * @param    rotation Amount to rotate pattern by
     * @returns           New RotatablePattern object with all entries rotated about the center of the pattern
     */
    public rotated(rotation: Rotation): RotatablePattern {
        const patternEntries: PatternEntry[] = [];
        for (const [x, y, v] of this._patternEntries) {
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
        return new RotatablePattern(patternEntries, this.center, this.integerCenter, this.rotationalCenter);
    }
}
