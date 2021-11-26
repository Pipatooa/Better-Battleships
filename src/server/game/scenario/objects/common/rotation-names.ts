import { Rotation } from 'shared/scenario/objects/common/rotation';

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
