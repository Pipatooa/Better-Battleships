import { AttributeCollection }     from '../attribute-collection';
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

    protected readonly abilityClass = 'ability-rotate';

    /**
     * AbilityFire constructor
     *
     * @param  ship                Ship that this ability belongs to
     * @param  index               Index of this ability in ship's ability list
     * @param  descriptor          Descriptor for ability
     * @param  icon                Url to icon for this ability
     * @param  rot90allowed        Whether a rotation by 90 degrees is allowed
     * @param  rot180allowed       Whether a rotation by 180 degrees is allowed
     * @param  rot270allowed       Whether a rotation by 270 degrees is allowed
     * @param  attributeCollection Attributes for this ability
     * @param  usable              Whether this ability is usable
     */
    public constructor(ship: Ship,
                       index: number,
                       descriptor: Descriptor,
                       icon: string,
                       public readonly rot90allowed: boolean,
                       public readonly rot180allowed: boolean,
                       public readonly rot270allowed: boolean,
                       attributeCollection: AttributeCollection,
                       usable: boolean) {
        super(ship, index, descriptor, icon, attributeCollection, usable);
    }

    /**
     * Factory function to generate AbilityRotate from transportable JSON
     *
     * @param    abilityRotateInfo JSON data for AbilityRotate
     * @param    ship              Ship that this ability belongs to
     * @param    index             Index of this ability in ship's ability list
     * @returns                    Created AbilityRotate object
     */
    public static fromInfo(abilityRotateInfo: IAbilityRotateInfo, ship: Ship, index: number): AbilityRotate {
        const descriptor = Descriptor.fromInfo(abilityRotateInfo.descriptor);
        const attributeCollection = new AttributeCollection(abilityRotateInfo.attributes);
        return new AbilityRotate(ship, index, descriptor, abilityRotateInfo.icon, abilityRotateInfo.rot90, abilityRotateInfo.rot180, abilityRotateInfo.rot270, attributeCollection, abilityRotateInfo.usable);
    }
    
    /**
     * Generates a board representing possible actions for this ability
     *
     * @returns  Board representing rotations available
     */
    public generateAbilityBoard(): undefined {
        return undefined;
    }
}
