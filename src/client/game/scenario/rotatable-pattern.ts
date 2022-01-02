import { Rotation }                   from 'shared/scenario/objects/common/rotation';
import { Pattern }                    from './pattern';
import type { PatternEntry }          from './pattern';
import type { IRotatablePatternInfo } from 'shared/network/scenario/i-rotatable-pattern-info';

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
     * @param  rotationalCenter Point about which the pattern rotates
     */
    protected constructor(_patternEntries: PatternEntry[],
                          center: [number, number],
                          private readonly rotationalCenter: number) {
        super(_patternEntries, center);
    }

    /**
     * Factory function to generate RotatablePattern from transportable JSON
     *
     * @param    rotatablePatternInfo JSON data for Pattern
     * @returns                       Created Pattern object
     */
    public static fromInfo(rotatablePatternInfo: IRotatablePatternInfo): RotatablePattern {
        return new RotatablePattern(rotatablePatternInfo.tiles as PatternEntry[], rotatablePatternInfo.center, rotatablePatternInfo.rotationCenter);
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
    protected rotatePoint(x: number, y: number, rotation: Rotation): [ number, number ] {

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
        return [ newX, newY ];
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
