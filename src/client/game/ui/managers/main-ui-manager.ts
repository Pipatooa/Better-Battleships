import { game }         from '../../game';
import { UIManager }    from './ui-manager';
import type { Player }  from '../../player';
import type { Ability } from '../../scenario/abilities/ability';

export class MainUIManager extends UIManager {
    
    public static turnOrder: Player[] = [];
    public static currentTurnIndex = 0;
    
    private static readonly sidebarTurnContainerElement = $('#sidebar-turn-container');

    private oldHighlightRegionID: string | undefined;

    /**
     * Called when the main canvas is clicked on
     */
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
        else
            this.selectedAbility = undefined;

        if (this._selectedShip !== oldSelected) {
            game.gameRenderer!.renderNext();
            this.updateSidebar();
        }
    }

    /**
     * Called when the ability canvas is clicked on
     *
     * @param  ev
     */
    protected onAbilityCanvasClick(): void {
        const [x, y] = this.abilityCanvasCoordinates!;
        const tile = game.abilityRenderer!.board?.tiles[Math.floor(y)]?.[Math.floor(x)];
        const abilityCallback = tile![3];
        abilityCallback?.();
    }

    /**
     * Called when an ability is currently selected or is being hovered over
     *
     * @param  ability   Relevant ability
     * @param  switching Whether there was an ability which was active before this ability became active
     */
    protected onAbilityActive(ability: Ability, switching: boolean): void {
        if (!switching)
            this.oldHighlightRegionID = game.board!.informationGenerator!.highlightedRegion;

        game.board!.informationGenerator!.clearHighlight();
        game.abilityRenderer!.renderAbility(ability);
        game.board!.informationGenerator!.push();
    }

    /**
     * Called when an ability is no longer currently selected or is being hovered over
     *
     * @param  ability   Relevant ability
     * @param  switching Whether this ability is no longer active because a new ability has become active
     */
    protected onAbilityDeactive(ability: Ability, switching: boolean): void {
        if (!switching) {
            game.board!.informationGenerator!.clearHighlight();
            if (this.oldHighlightRegionID !== undefined)
                game.board!.informationGenerator!.highlightRegion(this.oldHighlightRegionID);
            game.board!.informationGenerator!.push();
        }
    }
}
