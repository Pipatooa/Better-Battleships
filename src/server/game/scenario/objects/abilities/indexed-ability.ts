import { Ability } from './ability';

/**
 * IndexedAbility - Server Version
 *
 * Base class for abilities whose sub-abilities are numerically indexed
 */
export abstract class IndexedAbility extends Ability {

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  index Index of the sub-ability to use
     */
    public abstract use(index: number): void;
    
}
