import { game }                                      from '../../game';
import { selfPlayer }                                from '../../player';
import { TooltipElements }                           from '../element-cache';
import { updateSidebarShipSection }                  from '../updaters/sidebar-updater';
import { updateTooltip }                             from '../updaters/tooltip-updater';
import { createView, updateCurrentView, viewExists } from './view-manager';
import type { Player }                               from '../../player';
import type { Ability }                              from '../../scenario/abilities/ability';
import type { Tile }                                 from '../../scenario/board';
import type { Ship }                                 from '../../scenario/ship';

/**
 * UIManager - Client Version
 *
 * Base class for objects responsible for managing main UI elements
 */
export abstract class UIManager {

    private static _currentManager: UIManager | undefined;
    protected abstract readonly includeSelectedShipInVisibilityView: boolean;

    protected highlightedLocation: [number, number] = [-Infinity, -Infinity];
    protected highlightedTile: Tile | undefined;

    protected _mainCanvasCoordinates: [number, number] | undefined;
    protected _abilityCanvasCoordinates: [number, number] | undefined;

    protected _hoveredAbilityLocation: [number, number] | undefined;

    public tooltipInfoText: [string, string] | undefined = undefined;

    private _heldShip: Ship | undefined;
    protected heldShipCoordinates: [number, number] = [-Infinity, -Infinity];

    private _selectedShip: Ship | undefined;
    private _selectedAbility: Ability | undefined;
    private _hoveredAbility: Ability | undefined;
    private _hoveredPlayer: Player | undefined;

    private readonly pointerMoveListener: (ev: PointerEvent) => void;
    private readonly mainCanvasClickListener: () => void;
    private readonly mainCanvasLeaveListener: () => void;
    private readonly selectionCanvasClickListener: () => void;
    private readonly selectionCanvasLeaveListener: () => void;
    private readonly abilityCanvasClickListener: () => void;
    private readonly abilityCanvasLeaveListener: () => void;

    public updateMainCanvasSelectionLocation = true;

    /**
     * UIManager constructor
     *
     * Automatically deconstructs old UI manager and sets current UI manager to created object
     */
    public constructor() {
        UIManager._currentManager?.deconstruct();
        UIManager._currentManager = this;

        // Create event listeners
        this.pointerMoveListener = (ev: PointerEvent) => this.onPointerMove(ev);
        this.mainCanvasClickListener = () => this.onMainCanvasClick();
        this.mainCanvasLeaveListener = () => this.onMainCanvasLeave();
        this.selectionCanvasClickListener = () => this.onSelectionCanvasClick();
        this.selectionCanvasLeaveListener = () => this.onSelectionCanvasLeave();
        this.abilityCanvasClickListener = () => this.onAbilityCanvasClick();
        this.abilityCanvasLeaveListener = () => this.onAbilityCanvasLeave();

        // Register event handlers
        document.addEventListener('pointermove', this.pointerMoveListener);
        game.gameRenderer!.viewportHandler.canvas.addEventListener('click', this.mainCanvasClickListener);
        game.gameRenderer!.viewportHandler.canvas.addEventListener('mouseleave', this.mainCanvasLeaveListener);
        game.shipSelectionRenderer!.viewportHandler.canvas.addEventListener('click', this.selectionCanvasClickListener);
        game.shipSelectionRenderer!.viewportHandler.canvas.addEventListener('mouseleave', this.selectionCanvasLeaveListener);
        game.abilityRenderer!.viewportHandler.canvas.addEventListener('click', this.abilityCanvasClickListener);
        game.abilityRenderer!.viewportHandler.canvas.addEventListener('mouseleave', this.abilityCanvasLeaveListener);

        if (!viewExists('Visibility'))
            createView('Visibility', () => UIManager.currentManager!.updateVisibilityView(), () => {}, 'V');
    }

    /**
     * Allows this object to be discarded
     */
    protected deconstruct(): void {
        document.removeEventListener('pointermove', this.pointerMoveListener);
        game.gameRenderer!.viewportHandler.canvas.removeEventListener('click', this.mainCanvasClickListener);
        game.gameRenderer!.viewportHandler.canvas.removeEventListener('mouseleave', this.mainCanvasLeaveListener);
        game.shipSelectionRenderer!.viewportHandler.canvas.removeEventListener('click', this.selectionCanvasClickListener);
        game.shipSelectionRenderer!.viewportHandler.canvas.removeEventListener('mouseleave', this.selectionCanvasLeaveListener);
        game.abilityRenderer!.viewportHandler.canvas.removeEventListener('click', this.abilityCanvasClickListener);
        game.abilityRenderer!.viewportHandler.canvas.removeEventListener('mouseleave', this.abilityCanvasLeaveListener);
    }

    /**
     * Updates game tooltip information
     */
    public updateTooltip(): void {

        const tileInfo: [number, number, Tile] | undefined
            = this.highlightedTile !== undefined
                ? [...this.highlightedLocation, this.highlightedTile]
                : undefined;

        updateTooltip(this.tooltipInfoText, tileInfo, this._heldShip ?? this.highlightedTile?.[2], this._hoveredPlayer);
    }

    /**
     * Updates all information on the sidebar
     */
    protected updateSidebar(): void {
        updateSidebarShipSection(this._selectedShip,
            this._hoveredAbility ?? this._selectedAbility,
            [
                (ability) => this.setSelectedAbility(ability),
                (ability) => this.setHoveredAbility(ability),
                () => this.setHoveredAbility(undefined)
            ]);
    }

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
     * @param  ev Pointer movement event
     */
    protected updateSelection(ev: PointerEvent): void {

        // Update selection location
        if (this.updateMainCanvasSelectionLocation)
            this._mainCanvasCoordinates = game.gameRenderer!.updateSelectionLocation(ev);
        this._abilityCanvasCoordinates = game.abilityRenderer!.updateSelectionLocation(ev);

        // Update highlighted tile information
        if (this._mainCanvasCoordinates !== undefined && ev.target === game.gameRenderer!.viewportHandler.canvas) {
            const [x, y] = this._mainCanvasCoordinates;
            this.highlightedLocation = [Math.floor(x), Math.floor(y)];
            this.highlightedTile = game.board!.tiles[Math.floor(y)]?.[Math.floor(x)];
        } else {
            this.highlightedLocation = [-Infinity, -Infinity];
            this.highlightedTile = undefined;
        }

        // Update info text and hovered ability location if hovering over ability board
        // Call hover callback if hovered ability tile is newly hovered
        const oldHoveredAbilityLocation = this._hoveredAbilityLocation;
        this._hoveredAbilityLocation = undefined;
        if (this._abilityCanvasCoordinates !== undefined && ev.target === game.abilityRenderer!.viewportHandler.canvas) {
            const [x, y] = [Math.floor(this._abilityCanvasCoordinates[0]), Math.floor(this._abilityCanvasCoordinates[1])];
            const tile = game.abilityRenderer!.board?.tiles[y]?.[x];
            if (tile !== undefined) {
                const [tileType, , , hoverCallback] = tile;
                this.tooltipInfoText = [tileType.descriptor.name, tileType.descriptor.description];
                if (oldHoveredAbilityLocation?.[0] !== x || oldHoveredAbilityLocation?.[1] !== y) {
                    this._hoveredAbilityLocation = [x, y];
                    hoverCallback?.();
                } else
                    this._hoveredAbilityLocation = oldHoveredAbilityLocation;
            }
        }
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

    /**
     * Collection of functions called when canvas are clicked on or cursor leaves them respectively
     */

    protected onMainCanvasClick(): void {}
    protected onMainCanvasLeave(): void {
        this.tooltipInfoText = undefined;
    }
    protected onSelectionCanvasClick(): void {}
    protected onSelectionCanvasLeave(): void {
        this.tooltipInfoText = undefined;
    }
    protected onAbilityCanvasClick(): void {}
    protected onAbilityCanvasLeave(): void {
        this.tooltipInfoText = undefined;
    }

    /**
     * Updates the visibility view when it is active
     */
    private updateVisibilityView(): void {

        game.board!.informationGenerator!.clearHighlight();
        
        // Client is not holding a ship and no ship on the board is selected
        if (this._heldShip === undefined && (!this.includeSelectedShipInVisibilityView || this._selectedShip === undefined))
            // Show cumulative visibility of all ships on the board
            if (game.board!.ships.length > 0)
                for (const ship of game.board!.ships) {
                    if (ship.player !== selfPlayer)
                        continue;
                    game.board!.informationGenerator!.highlightPattern(ship.x!, ship.y!, ship.visibilityPattern);
                }
            // Make entire board dark if no ships are on the board
            else
                game.board!.informationGenerator!.enableHighlighting();
        else {
            // Held ship
            if (this._heldShip !== undefined)
                game.board!.informationGenerator!.highlightPattern(...this.heldShipCoordinates, this._heldShip.visibilityPattern);
            // Selected ship
            else if (this._selectedShip !== undefined)
                game.board!.informationGenerator!.highlightPattern(this._selectedShip.x!, this._selectedShip.y!, this._selectedShip.visibilityPattern);
        }

        game.board!.informationGenerator!.push();
        game.gameRenderer!.renderNext();
    }

    /**
     * Sets the currently selected ship and updates the UI and renderer state accordingly
     *
     * @param  ship Ship to select
     */
    protected setSelectedShip(ship: Ship | undefined): void {
        if (ship === this._selectedShip)
            return;

        this._selectedShip = ship;
        this.updateSidebar();
        updateCurrentView();
        game.board!.informationGenerator!.push();
        game.gameRenderer!.renderNext();

        const lastSelectedAbility = ship?.lastSelectedAbility;
        this.setSelectedAbility(lastSelectedAbility);
        if (lastSelectedAbility !== undefined) {
            lastSelectedAbility.createAbilityView();
            this.updateSidebar();
            game.abilityRenderer!.renderAbility(lastSelectedAbility);
        }
    }

    /**
     * Sets the currently selected ability and updates UI and renderer state accordingly
     *
     * @param  ability Ability to select
     */
    protected setSelectedAbility(ability: Ability | undefined): void {

        // Selecting an already selected ability will act as a deselection
        if (this._selectedAbility === ability)
            ability = undefined;

        this._selectedAbility?.gameElement!.removeClass('selected-ability');
        if (this._hoveredAbility === undefined && ability === undefined)
            this._selectedAbility?.removeAbilityView();
        ability?.gameElement!.addClass('selected-ability');
        this._selectedAbility = ability;
        if (this._selectedShip !== undefined)
            this._selectedShip.lastSelectedAbility = ability;
    }

    /**
     * Sets the currently hovered ability and updates the UI and renderer state accordingly
     *
     * @param  ability Ability to set as hovered
     */
    protected setHoveredAbility(ability: Ability | undefined): void {
        if (this._hoveredAbility === ability)
            return;
        if (this._selectedAbility !== undefined && this._selectedAbility === ability)
            return;

        const oldHoveredAbility = this._hoveredAbility;
        this._hoveredAbility = ability;
        this.updateSidebar();

        if (ability !== undefined) {
            this._selectedAbility?.removeAbilityView();
            game.abilityRenderer!.renderAbility(ability);
            ability.createAbilityView();
        } else {
            oldHoveredAbility?.removeAbilityView();
            if (this._selectedAbility !== undefined) {
                game.abilityRenderer!.renderAbility(this._selectedAbility);
                this._selectedAbility.createAbilityView();
            }
        }
    }

    /**
     * Sets the currently held ship and updates the UI and renderer state accordingly
     *
     * @param  ship Ship to set as held
     */
    protected setHeldShip(ship: Ship | undefined): void {
        if (ship === this._heldShip)
            return;

        game.shipSelectionRenderer!.selectionInfoGenerator.setSelectionShip(ship);
        game.shipSelectionRenderer!.selectionInfoGenerator.push();
        game.shipSelectionRenderer!.renderNext();
        game.gameRenderer!.selectionInfoGenerator.setSelectionShip(ship);
        game.gameRenderer!.selectionInfoGenerator.push();
        this.setSelectedAbility(undefined);
        this._heldShip = ship;
        this.updateTooltip();
        updateCurrentView();
        game.board!.informationGenerator!.push();
        game.gameRenderer!.renderNext();
    }

    /**
     * Getters and setters
     */

    public static get currentManager(): UIManager | undefined {
        return this._currentManager;
    }

    public get mainCanvasCoordinates(): [number, number] | undefined {
        return this._mainCanvasCoordinates;
    }

    public get abilityCanvasCoordinates(): [number, number] | undefined {
        return this._abilityCanvasCoordinates;
    }

    public get hoveredAbilityLocation(): [number, number] | undefined {
        return this._hoveredAbilityLocation;
    }

    public get selectedShip(): Ship | undefined {
        return this._selectedShip;
    }

    protected get selectedAbility(): Ability | undefined {
        return this._selectedAbility;
    }

    protected get hoveredAbility(): Ability | undefined {
        return this._hoveredAbility;
    }

    public get hoveredPlayer(): Player | undefined {
        return this._hoveredPlayer;
    }

    public set hoveredPlayer(player: Player | undefined) {
        this._hoveredPlayer = player;
        this.updateTooltip();
    }

    public get heldShip(): Ship | undefined {
        return this._heldShip;
    }
}
