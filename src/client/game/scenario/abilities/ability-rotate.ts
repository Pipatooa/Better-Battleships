import { Descriptor }              from '../descriptor';
import { Ability }                 from './ability';
import type { Ship }               from '../ship';
import type { IAbilityRotateInfo } from 'shared/network/scenario/ability-info';

/**
 * AbilityFire - Client Version
 *
 * Ability which rotates a ship upon its use
 */
export class AbilityRotate extends Ability {

    /**
     * AbilityFire constructor
     *
     * @param  ship          Ship that this ability belongs to
     * @param  index         Index of this ability in ship's ability list
     * @param  descriptor    Descriptor for ability
     * @param  rot90allowed  Whether or not a rotation by 90 degrees is allowed
     * @param  rot180allowed Whether or not a rotation by 180 degrees is allowed
     * @param  rot270allowed Whether or not a rotation by 270 degrees is allowed
     */
    public constructor(ship: Ship,
                       index: number,
                       descriptor: Descriptor,
                       public readonly rot90allowed: boolean,
                       public readonly rot180allowed: boolean,
                       public readonly rot270allowed: boolean) {
        super(ship, index, descriptor);
    }

    /**
     * Factory function to generate AbilityRotate from JSON event data
     *
     * @param    abilityRotateSource JSON data from server
     * @param    ship                Ship that this ability belongs to
     * @param    index               Index of this ability in ship's ability list
     * @returns                      Created AbilityRotate object
     */
    public static fromSource(abilityRotateSource: IAbilityRotateInfo, ship: Ship, index: number): AbilityRotate {
        const descriptor = Descriptor.fromSource(abilityRotateSource.descriptor);
        return new AbilityRotate(ship, index, descriptor, abilityRotateSource.rot90, abilityRotateSource.rot180, abilityRotateSource.rot270);
    }
}
