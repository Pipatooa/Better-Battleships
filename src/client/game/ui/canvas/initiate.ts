import { game }                  from '../../game';
import { ColorAtlas }            from './color-atlas';
import { AbilityRenderer }       from './renderers/ability-renderer';
import { GameRenderer }          from './renderers/game-renderer';
import { ShipSelectionRenderer } from './renderers/ship-selection-renderer';
import type { Ship }             from '../../scenario/ship';

/**
 * Initiates all game renderers
 *
 * @param  ships Ships for the player to place
 */
export function initiateRenderers(ships: Ship[]): void {
    const colorAtlas = new ColorAtlas();
    colorAtlas.registerTeamColors();
    colorAtlas.registerPlayerColors();
    colorAtlas.registerTileColors(game.board!.tileTypes);
    new GameRenderer(colorAtlas);
    new ShipSelectionRenderer(colorAtlas, ships);
    new AbilityRenderer(colorAtlas);
}
