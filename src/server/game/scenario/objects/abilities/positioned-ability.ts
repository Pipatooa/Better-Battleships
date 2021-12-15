import { Ability } from './ability';

/**
 * PositionedAbility - Server Version
 *
 * Base class for abilities whose sub-abilities describe positions
 */
export abstract class PositionedAbility extends Ability {

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  x X coordinate of position of sub-ability
     * @param  y Y coordinate of position of sub-ability
     */
    public abstract use(x: number, y: number): void;

}
