import { sendRequest }           from '../../sockets/opener';
import { Descriptor }            from '../descriptor';
import { Pattern }               from '../pattern';
import { Ability }               from './ability';
import type { Ship }             from '../ship';
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
     * @param  ship       Ship that this ability belongs to
     * @param  index      Index of this ability in ship's ability list
     * @param  descriptor Descriptor for ability
     * @param  pattern    Pattern describing possible movements
     */
    public constructor(ship: Ship,
                       index: number,
                       descriptor: Descriptor,
                       public readonly pattern: Pattern) {
        super(ship, index, descriptor);
    }

    /**
     * Factory function to generate AbilityMove from JSON event data
     *
     * @param    abilityMoveSource JSON data from server
     * @param    ship              Ship that this ability belongs to
     * @param    index             Index of this ability in ship's ability list
     * @returns                    Created AbilityMove object
     */
    public static fromSource(abilityMoveSource: IAbilityMoveInfo, ship: Ship, index: number): AbilityMove {
        const descriptor = Descriptor.fromSource(abilityMoveSource.descriptor);
        const pattern = Pattern.fromSource(abilityMoveSource.pattern);
        return new AbilityMove(ship, index, descriptor, pattern);
    }

    public use(dx: number, dy: number): void {
        sendRequest({
            request: 'useAbility',
            ship: this.ship.trackingID,
            ability: this.index,
            x: dx,
            y: dy
        });
    }
}
