import { game }        from '../../game';
import { UIManager }   from './ui-manager';
import type { Player } from '../../player';

/**
 * MainUIManager - Client Version
 *
 * Responsible for updating main UI elements during gameplay
 */
export class MainUIManager extends UIManager {

    protected readonly includeSelectedShipInVisibilityView = true;

    public static turnOrder: Player[] = [];
    public static currentTurnIndex = 0;

    /**
     * Called when the main canvas is clicked on
     */
    protected onMainCanvasClick(): void {
        const oldSelected = this.selectedShip;
        let newShip = this.highlightedTile?.[2];

        // Clicking on an already selected ship will act as a deselection
        if (newShip === oldSelected)
            newShip = undefined;

        // Update selected-ness of ships
        if (oldSelected !== undefined)
            oldSelected.selected = false;
        if (newShip !== undefined)
            newShip.selected = true;

        this.setSelectedShip(newShip);
    }

    /**
     * Called when the ability canvas is clicked on
     */
    protected onAbilityCanvasClick(): void {
        const [x, y] = this._abilityCanvasCoordinates!;
        const tile = game.abilityRenderer!.board?.tiles[Math.floor(y)]?.[Math.floor(x)];
        const abilityClickCallback = tile?.[4];
        abilityClickCallback?.();
    }
}
