import { game }                  from '../game';
import { ColorAtlas }            from './color-atlas';
import { GameRenderer }          from './game-renderer';
import { ShipSelectionRenderer } from './ship-selection-renderer';
import type { Ship }             from '../scenario/ship';

/**
 * Initiates all game renderers
 *
 * @param  spawnRegionID Starting region for player
 * @param  ships         Ships for the player to place
 */
export function initiateRenderers(spawnRegionID: string, ships: Ship[]): void {
    const colorAtlas = new ColorAtlas();
    colorAtlas.registerTeamColors();
    colorAtlas.registerPlayerColors();
    colorAtlas.registerTileColors(game.board!.tileTypes);
    new GameRenderer(colorAtlas, spawnRegionID);
    new ShipSelectionRenderer(colorAtlas, ships);
}
