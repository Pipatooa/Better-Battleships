/**
 * Enum describing different rotations available
 */
export const enum Rotation {
    None,
    Clockwise90,
    Clockwise180,
    Clockwise270,
    FullRotation
}

/**
 * Rotates a point about a center coordinate
 *
 * @param    point    Point to rotate
 * @param    center   Center about which to rotate point
 * @param    rotation Rotation to apply to point
 * @returns           Point after rotation
 */
export function rotatePoint(point: [number, number], center: [number, number], rotation: Rotation): [number, number] {

    // Get dx and dy of point from center
    const dx = point[0] - center[0];
    const dy = point[1] - center[1];

    let newDx: number;
    let newDy: number;

    // Perform rotation transforms
    switch (rotation) {
        case Rotation.None:
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
    const newX = newDx + center[0];
    const newY = newDy + center[1];
    return [newX, newY];
}
