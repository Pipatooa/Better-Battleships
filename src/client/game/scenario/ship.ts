import type { PatternRenderer } from '../canvas/pattern-renderer';
import type { Player } from '../player';
import type { Ability } from './abilities/ability';
import type { Descriptor } from './descriptor';
import type { Pattern } from './pattern';

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
     * @param  index      Index of this ship in player's ship list
     * @param  x          X coordinate of ship
     * @param  y          Y coordinate of ship
     * @param  descriptor Descriptor for ship
     * @param  pattern    Pattern describing shape of ship
     * @param  player     Player that this ship belongs to
     * @param  abilities  Dictionary of abilities available for this ship
     */
    public constructor(public readonly index: number | undefined,
                       public x: number,
                       public y: number,
                       public readonly descriptor: Descriptor,
                       public pattern: Pattern,
                       public readonly player: Player,
                       public readonly abilities: Ability[]) {

        // Add ship to list of all ships
        allShips.push(this);
    }

    /**
     * Removes this player from list of all ships
     */
    public deconstruct(): void {
        allShips = allShips.filter(s => s !== this);
        this.patternRenderer?.deRender();
    }
}

/**
 * Finds a ship at a given location
 *
 * @param    x X coordinate to look for ship
 * @param    y Y coordinate to look for 
 * @returns    Found ship or null if no ship is found
 */
export function findShip(x: number, y: number): Ship | undefined {
    
    // Iterate through all ships
    for (const ship of allShips) {
        
        // Iterate through all cells of each ship
        for (const patternEntry of ship.pattern.patternEntries) {
            
            // Calculate position of cell relative to board
            const shipX = ship.x + patternEntry.x;
            const shipY = ship.y + patternEntry.y;
            
            // If tile is at location, return ship
            if (x == shipX && y == shipY) {
                return ship;
            }
        }
    }
    
    // Otherwise return no ship
    return undefined;
}
