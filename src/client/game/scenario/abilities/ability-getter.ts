import { AbilityFire }      from './ability-fire';
import { AbilityMove }      from './ability-move';
import { AbilityRotate }    from './ability-rotate';
import type { Ship }        from '../ship';
import type { Ability }     from './ability';
import type { AbilityInfo } from 'shared/network/scenario/ability-info';

/**
 * Gets an array of abilities for a ship
 *
 * @param    ship         Ship that the abilities should belong to
 * @param    abilityInfos Array of ability information to create abilities from
 * @returns               Array of Ability objects
 */
export function getAbilities(ship: Ship, abilityInfos: AbilityInfo[]): Ability[] {
    const abilities: Ability[] = [];
    for (let abilityIndex = 0; abilityIndex < abilityInfos.length; abilityIndex++) {
        const abilityInfo = abilityInfos[abilityIndex];

        let ability: Ability;
        switch (abilityInfo.type) {
            case 'move':
                ability = AbilityMove.fromSource(abilityInfo, ship, abilityIndex);
                break;
            case 'rotate':
                ability = AbilityRotate.fromSource(abilityInfo, ship, abilityIndex);
                break;
            case 'fire':
                ability = AbilityFire.fromSource(abilityInfo, ship, abilityIndex);
                break;
        }
        abilities.push(ability);
    }

    return abilities;
}
