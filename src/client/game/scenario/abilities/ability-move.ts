import type { IAbilityMoveInfo } from '../../../../shared/network/scenario/ability-info';
import { Descriptor } from '../descriptor';
import { Pattern } from '../pattern';
import { Ability } from './ability';

/**
 * AbilityFire - Client Version
 *
 * Ability which moves a ship upon its use
 */
export class AbilityMove extends Ability {

    /**
     * AbilityFire constructor
     *
     * @param  index      Index of this ability in ship's ability list
     * @param  descriptor Descriptor for ability
     * @param  pattern    Pattern describing possible movements
     */
    public constructor(index: number,
                       descriptor: Descriptor,
                       public readonly pattern: Pattern) {
        super(index, descriptor);
    }

    /**
     * Factory function to generate AbilityMove from JSON event data
     *
     * @param    abilityMoveSource JSON data from server
     * @param    index             Index of this ability in ship's ability list
     * @returns                    Created AbilityMove object
     */
    public static fromSource(abilityMoveSource: IAbilityMoveInfo, index: number): AbilityMove {
        const descriptor = Descriptor.fromSource(abilityMoveSource.descriptor);
        const pattern = Pattern.fromSource(abilityMoveSource.pattern);
        return new AbilityMove(index, descriptor, pattern);
    }
}
