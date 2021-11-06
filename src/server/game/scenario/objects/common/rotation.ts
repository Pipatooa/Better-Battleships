/**
 * Enum describing different rotations available
 */
export enum Rotation {
    NoChange,
    Clockwise90,
    Clockwise180,
    Clockwise270
}

/**
 * Mapping of friendly rotation names to internal rotation amounts
 */
export const rotationNames: { [name: number]: Rotation } = {
    0: Rotation.NoChange,
    90: Rotation.Clockwise90,
    180: Rotation.Clockwise180,
    270: Rotation.Clockwise270,
    [-90]: Rotation.Clockwise270
};
