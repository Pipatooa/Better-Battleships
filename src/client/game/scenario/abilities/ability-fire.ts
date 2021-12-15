import { Descriptor }            from '../descriptor';
import { Pattern }               from '../pattern';
import { Ability }               from './ability';
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
     * @param  shipIndex        Index of the ship that this ability belongs to
     * @param  index            Index of this ability in ship's ability list
     * @param  descriptor       Descriptor for ability
     * @param  selectionPattern Pattern determining which cell can be selected to apply the affect pattern around
     * @param  effectPattern    Pattern determining which cells around the selected cell are affected
     */
    public constructor(shipIndex: number,
                       index: number,
                       descriptor: Descriptor,
                       public readonly selectionPattern: Pattern,
                       public readonly effectPattern: Pattern) {
        super(shipIndex, index, descriptor);
    }

    /**
     * Factory function to generate AbilityFire from JSON event data
     *
     * @param    abilityFireSource JSON data from server
     * @param    shipIndex         Index of the ship that this ability belongs to
     * @param    index             Index of this ability in ship's ability list
     * @returns                    Created AbilityFire object
     */
    public static fromSource(abilityFireSource: IAbilityFireInfo, shipIndex: number, index: number): AbilityFire {
        const descriptor = Descriptor.fromSource(abilityFireSource.descriptor);
        const selectionPattern = Pattern.fromSource(abilityFireSource.selectionPattern);
        const effectPattern = Pattern.fromSource(abilityFireSource.effectPattern);
        return new AbilityFire(shipIndex, index, descriptor, selectionPattern, effectPattern);
    }
}
