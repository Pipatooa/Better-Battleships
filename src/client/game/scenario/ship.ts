import { gameRenderer } from '../canvas/game-renderer';
import { PatternRenderer } from '../canvas/pattern-renderer';
import { Player } from '../player';
import { Descriptor } from './descriptor';
import { Pattern } from './pattern';

export let allShips: Ship[] = [];

/**
 * Ship - Client Version
 *
 * Movable object that exists on the board
 */
export class Ship {

    public doRender = false;
    public patternRenderer: PatternRenderer | undefined;

    /**
     * Ship constructor
     *
     * @param  x          X coordinate of ship
     * @param  y          Y coordinate of ship
     * @param  descriptor Descriptor for ship
     * @param  pattern    Pattern describing shape of ship
     * @param  player     Player that this ship belongs to
     */
    public constructor(public x: number,
                       public y: number,
                       public descriptor: Descriptor,               
                       public pattern: Pattern,
                       public player: Player) {

        // Add ship to list of all ships
        allShips.push(this);
    }
}