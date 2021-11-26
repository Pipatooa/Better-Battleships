import { game }                     from '../../game';
import { TooltipElements }          from '../element-cache';
import { updateSidebarShipSection } from '../updaters/sidebar-updater';
import { updateTooltip }            from '../updaters/tooltip-updater';
import type { Ability }             from '../../scenario/abilities/ability';
import type { Tile }                from '../../scenario/board';
import type { Ship }                from '../../scenario/ship';

/**
 * UIManager - Client Version
 *
 * Base class for all objects responsible for updating UI elements
 */
export abstract class UIManager {

    private static _currentManager: UIManager | undefined;

    protected highlightedLocationRaw: [number, number] = [-Infinity, -Infinity];
    protected highlightedLocation: [number, number] = [-Infinity, -Infinity];
    protected highlightedTile: Tile | undefined;

    protected tooltipInfoText: [string, string] | undefined = undefined;

    protected _heldShip: Ship | undefined;
    private readonly placementFeedback: string | undefined;

    protected _selectedShip: Ship | undefined;
    protected _previouslyDisplayedShip: Ship | undefined;
    
    protected selectedAbility: Ability | undefined;
    protected _hoveredAbility: Ability | undefined;

    private readonly pointerMoveListener: (ev: PointerEvent) => void;
    private readonly mainCanvasClickListener: () => void;
    private readonly selectionCanvasClickListener: () => void;
    private readonly abilityCanvasClickListener: () => void;

    /**
     * UIManager constructor
     *
     * Automatically deconstructs old UI manager and sets current UI manager to created object
     */
    public constructor() {
        UIManager._currentManager?.deconstruct();
        UIManager._currentManager = this;

        this.pointerMoveListener = (ev: PointerEvent) => this.onPointerMove(ev);
        this.mainCanvasClickListener = () => this.onMainCanvasClick();
        this.selectionCanvasClickListener = () => this.onSelectionCanvasClick();
        this.abilityCanvasClickListener = () => this.onAbilityCanvasClick();

        // Register event handlers
        document.addEventListener('pointermove', this.pointerMoveListener);
        game.gameRenderer!.viewportHandler.canvas.addEventListener('click', this.mainCanvasClickListener);
        game.shipSelectionRenderer!.viewportHandler.canvas.addEventListener('click', this.selectionCanvasClickListener);
        game.abilityRenderer!.viewportHandler.canvas.addEventListener('click', this.abilityCanvasClickListener);
    }

    /**
     * Allows this object to be discarded
     */
    protected deconstruct(): void {
        document.removeEventListener('pointermove', this.pointerMoveListener);
        game.gameRenderer!.viewportHandler.canvas.removeEventListener('click', this.mainCanvasClickListener);
        game.shipSelectionRenderer!.viewportHandler.canvas.removeEventListener('click', this.selectionCanvasClickListener);
        game.abilityRenderer!.viewportHandler.canvas.removeEventListener('click', this.abilityCanvasClickListener);
    }

    /**
     * Updates game tooltip information
     */
    public updateTooltip(): void {

        const tileInfo: [number, number, Tile] | undefined
            = this.highlightedTile !== undefined
                ? [...this.highlightedLocation, this.highlightedTile]
                : undefined;

        updateTooltip(this.tooltipInfoText, tileInfo, this._heldShip ?? this.highlightedTile?.[2]);
    }

    /**
     * Updates all information on the sidebar
     */
    protected updateSidebar(): void {
        updateSidebarShipSection(this._selectedShip,
            this._hoveredAbility ?? this.selectedAbility,
            [
                (ability) => this.onAbilitySelect(ability),
                (ability) => this.hoveredAbility = ability,
                () => this.hoveredAbility = undefined
            ]);
    }

    /**
     * Called when an ability is clicked upon
     *
     * @param  ability Relevant ability
     */
    protected onAbilitySelect(ability: Ability): void {
        const oldSelectedAbility = this.selectedAbility;
        this.selectedAbility = ability;

        // Clicking on an already selected ability will act as a deselection
        if (this.selectedAbility === oldSelectedAbility)
            this.selectedAbility = undefined;
        
        oldSelectedAbility?.gameElement!.removeClass('selected-ability');
        this.selectedAbility?.gameElement!.addClass('selected-ability');
    }

    /**
     * Called when an ability is currently selected or is being hovered over
     *
     * @param  ability   Relevant ability
     * @param  switching Whether there was an ability which was active before this ability became active
     */
    protected onAbilityActive(ability: Ability, switching: boolean): void {
        game.abilityRenderer!.renderAbility(ability);
    }


    /**
     * Called when an ability is no longer currently selected or is being hovered over
     *
     * @param  ability   Relevant ability
     * @param  switching Whether this ability is no longer active because a new ability has become active
     */
    protected onAbilityDeactive(ability: Ability, switching: boolean): void {}

    /**
     * Moves the game tooltip to follow the cursor
     *
     * @param  x X coordinate of cursor
     * @param  y Y coordinate of cursor
     */
    protected moveTooltip(x: number, y: number): void {
        const tooltipGap = 5;
        const rawTooltip = TooltipElements.tooltip.rawElement;

        // If tooltip is too close to right of screen, move it to left of cursor
        rawTooltip.style.left = window.innerWidth - x - rawTooltip.clientWidth < 2 * tooltipGap
            ? `${x - tooltipGap - rawTooltip.clientWidth}px`
            : `${x + tooltipGap}px`;

        // If tooltip is too close to bottom of screen, move it on top of cursor
        rawTooltip.style.top = window.innerHeight - y - rawTooltip.clientHeight < 2 * tooltipGap
            ? `${y - tooltipGap - rawTooltip.clientHeight}px`
            : `${y + tooltipGap}px`;
    }

    /**
     * Updates the location of the current selection
     *
     * @param    ev Pointer movement event
     * @returns     Non-rounded main board coordinates corresponding to mouse position
     */
    protected updateSelection(ev: PointerEvent): ([number, number] | undefined)[] {
        const mainCoordinates = game.gameRenderer!.updateSelectionLocation(ev);
        const abilityCoordinates = game.abilityRenderer!.updateSelectionLocation(ev);

        // Update highlighted location on the main canvas
        if (mainCoordinates !== undefined && ev.target === game.gameRenderer!.viewportHandler.canvas) {
            const [x, y] = mainCoordinates;
            this.highlightedLocationRaw = [x, y];
            this.highlightedLocation = [Math.floor(x), Math.floor(y)];
            this.highlightedTile = game.board!.tiles[Math.floor(y)]?.[Math.floor(x)];
        } else {
            this.highlightedLocationRaw = [-Infinity, -Infinity];
            this.highlightedLocation = [-Infinity, -Infinity];
            this.highlightedTile = undefined;
        }

        // Update info text if hovering over ability board
        if (abilityCoordinates !== undefined && ev.target === game.abilityRenderer!.viewportHandler.canvas) {
            const [x, y] = abilityCoordinates;
            const tileType = game.abilityRenderer!.board?.tiles[Math.floor(y)]?.[Math.floor(x)][0];
            if (tileType !== undefined) {
                this.tooltipInfoText = [tileType.descriptor.name, tileType.descriptor.description];
            }
        } else {
            this.tooltipInfoText = undefined;
        }
        
        return [mainCoordinates, abilityCoordinates];
    }

    /**
     * Called when the pointer is moved across the screen
     *
     * @param  ev Pointer movement event to handle
     */
    protected onPointerMove(ev: PointerEvent): void {
        this.updateSelection(ev);
        this.updateTooltip();
        this.moveTooltip(ev.x, ev.y);
    }

    protected onMainCanvasClick(): void {}
    protected onSelectionCanvasClick(): void {}
    protected onAbilityCanvasClick(): void {}

    /**
     * Getters and setters
     */

    public static get currentManager(): UIManager | undefined {
        return this._currentManager;
    }

    protected set hoveredAbility(ability: Ability | undefined) {
        const previousActiveAbility = this.selectedAbility ?? this._hoveredAbility;
        this._hoveredAbility = ability;
        this.updateSidebar();
        const newActiveAbility = this.selectedAbility ?? this._hoveredAbility;

        if (previousActiveAbility)
            this.onAbilityDeactive(previousActiveAbility, newActiveAbility !== undefined);
        if (newActiveAbility)
            this.onAbilityActive(newActiveAbility, previousActiveAbility !== undefined);
    }
}
