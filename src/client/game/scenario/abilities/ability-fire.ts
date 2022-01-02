import { AttributeCollection }   from '../attribute-collection';
import { Descriptor }            from '../descriptor';
import { Pattern }               from '../pattern';
import { Ability }               from './ability';
import type { Ship }             from '../ship';
import type { IAbilityFireInfo } from 'shared/network/scenario/ability-info';

/**
 * AbilityFire - Client Version
 *
 * Ability which acts upon a selected group of cells upon its use
 */
export class AbilityFire extends Ability {

    /**
     * AbilityFire constructor
     *
     * @param  ship                Ship that this ability belongs to
     * @param  index               Index of this ability in ship's ability list
     * @param  descriptor          Descriptor for ability
     * @param  selectionPattern    Pattern determining which cell can be selected to apply the affect pattern around
     * @param  effectPattern       Pattern determining which cells around the selected cell are affected
     * @param  attributeCollection Attribute for this ability
     * @param  usable              Whether this ability is usable
     */
    public constructor(ship: Ship,
                       index: number,
                       descriptor: Descriptor,
                       public readonly selectionPattern: Pattern,
                       public readonly effectPattern: Pattern,
                       attributeCollection: AttributeCollection,
                       usable: boolean) {
        super(ship, index, descriptor, attributeCollection, usable);
    }

    /**
     * Factory function to generate AbilityFire from transportable JSON
     *
     * @param    abilityFireInfo JSON data for AbilityFire
     * @param    ship            Ship that this ability belongs to
     * @param    index           Index of this ability in ship's ability list
     * @returns                  Created AbilityFire object
     */
    public static fromInfo(abilityFireInfo: IAbilityFireInfo, ship: Ship, index: number): AbilityFire {
        const descriptor = Descriptor.fromInfo(abilityFireInfo.descriptor);
        const selectionPattern = Pattern.fromInfo(abilityFireInfo.selectionPattern);
        const effectPattern = Pattern.fromInfo(abilityFireInfo.effectPattern);
        const attributeCollection = new AttributeCollection(abilityFireInfo.attributes);
        return new AbilityFire(ship, index, descriptor, selectionPattern, effectPattern, attributeCollection, abilityFireInfo.usable);
    }

    /**
     * Generates a board representing possible actions for this ability
     *
     * @returns  No board for this ability
     */
    public generateAbilityBoard(): undefined {
        return undefined;
    }
}
