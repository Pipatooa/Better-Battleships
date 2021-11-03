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