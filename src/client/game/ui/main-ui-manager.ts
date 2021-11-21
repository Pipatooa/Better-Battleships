import { UIManager }   from './ui-manager';
import type { Player } from '../player';

export class MainUIManager extends UIManager {
    
    public static turnOrder: Player[] = [];
    public static currentTurnIndex = 0;
    
    private static readonly sidebarTurnContainerElement = $('#sidebar-turn-container');

    protected onMainCanvasClick(): void {
        const oldSelected = this._selectedShip;
        this._selectedShip = this.highlightedTile?.[2];

        // Clicking on an already selected ship will act as a deselection
        if (this._selectedShip === oldSelected)
            this._selectedShip = undefined;

        // Update selected-ness of ships
        if (oldSelected !== undefined)
            oldSelected.selected = false;
        if (this._selectedShip !== undefined)
            this._selectedShip.selected = true;

        this.updateSidebar();
    }
}
