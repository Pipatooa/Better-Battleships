import { sendRequest }           from '../../sockets/opener';
import { Descriptor }            from '../descriptor';
import { Pattern }               from '../pattern';
import { Ability }               from './ability';
import type { IAbilityMoveInfo } from 'shared/network/scenario/ability-info';

/**
 * AbilityMove - Client Version
 *
 * Ability which moves a ship upon its use
 */
export class AbilityMove extends Ability {

    /**
     * AbilityMove constructor
     *
     * @param  shipIndex  Index of the ship that this ability belongs to
     * @param  index      Index of this ability in ship's ability list
     * @param  descriptor Descriptor for ability
     * @param  pattern    Pattern describing possible movements
     */
    public constructor(shipIndex: number,
                       index: number,
                       descriptor: Descriptor,
                       public readonly pattern: Pattern) {
        super(shipIndex, index, descriptor);
    }

    /**
     * Factory function to generate AbilityMove from JSON event data
     *
     * @param    abilityMoveSource JSON data from server
     * @param    shipIndex         Index of the ship that this ability belongs to
     * @param    index             Index of this ability in ship's ability list
     * @returns                    Created AbilityMove object
     */
    public static fromSource(abilityMoveSource: IAbilityMoveInfo, shipIndex: number, index: number): AbilityMove {
        const descriptor = Descriptor.fromSource(abilityMoveSource.descriptor);
        const pattern = Pattern.fromSource(abilityMoveSource.pattern);
        return new AbilityMove(shipIndex, index, descriptor, pattern);
    }

    public use(dx: number, dy: number): void {
        sendRequest({
            request: 'useAbility',
            ship: this.shipIndex,
            ability: this.index,
            x: dx,
            y: dy
        });
    }
}
