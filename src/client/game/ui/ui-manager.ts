import { game }                      from '../game';
import { VariableVisibilityElement } from './variable-visibility-element';
import type { Tile }                 from '../scenario/board';
import type { Ship }                 from '../scenario/ship';

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

    protected _heldShip: Ship | undefined;
    private readonly placementFeedback: string | undefined;

    protected _selectedShip: Ship | undefined;

    private readonly pointerMoveListener: (ev: PointerEvent) => void;
    private readonly selectionCanvasClickListener: () => void;
    private readonly mainCanvasClickListener: () => void;

    // Tooltip elements
    private static readonly tooltipElement = new VariableVisibilityElement($('#game-tooltip'));
    
    private static readonly tooltipTileSectionElement = new VariableVisibilityElement($('#game-tooltip-tile-section'));
    private static readonly tooltipTileCoordinatesElement = $('#game-tooltip-tile-coordinates');
    private static readonly tooltipTileNameElement = $('#game-tooltip-tile-name');
    private static readonly tooltipTileTraversableElement = $('#game-tooltip-tile-traversable');
    
    private static readonly tooltipShipSectionElement = new VariableVisibilityElement($('#game-tooltip-ship-section'));
    private static readonly tooltipShipNameElement = $('#game-tooltip-ship-name');
    private static readonly tooltipShipOwnerElement = $('#game-tooltip-ship-owner');

    // Sidebar elements
    private static readonly sidebarShipSection = new VariableVisibilityElement($('#sidebar-ship-section'));
    private static readonly sidebarShipNameElement = $('#sidebar-ship-name');
    private static readonly sidebarShipOwnerElement = $('#sidebar-ship-owner');
    private static readonly sidebarShipDescriptionElement = $('#sidebar-ship-description');
    private static readonly sidebarShipAttributesElement = $('#sidebar-ship-attributes');
    private static readonly sidebarShipAbilitiesElement = $('#sidebar-ship-abilities');
    private static readonly sidebarShipAbilityNameElement = $('#sidebar-ship-ability-name');
    private static readonly sidebarShipAbilityDescriptionElement = $('#sidebar-ship-ability-description');
    private static readonly sidebarShipAbilityHelpTextElement = $('#sidebar-ship-ability-help-text');

    /**
     * UIManager constructor
     *
     * Automatically deconstructs old UI manager and sets current UI manager to created object
     */
    public constructor() {
        UIManager._currentManager?.deconstruct();
        UIManager._currentManager = this;

        this.pointerMoveListener = (ev: PointerEvent) => this.onPointerMove(ev);
        this.selectionCanvasClickListener = () => this.onSelectionCanvasClick();
        this.mainCanvasClickListener = () => this.onMainCanvasClick();

        // Register event handlers
        document.addEventListener('pointermove', this.pointerMoveListener);
        game.gameRenderer!.viewportHandler.canvas.addEventListener('click', this.mainCanvasClickListener);
        game.shipSelectionRenderer!.viewportHandler.canvas.addEventListener('click', this.selectionCanvasClickListener);
    }

    /**
     * Allows this object to be discarded
     */
    private deconstruct(): void {
        document.removeEventListener('pointermove', this.pointerMoveListener);
        game.gameRenderer!.viewportHandler.canvas.removeEventListener('click', this.mainCanvasClickListener);
        game.shipSelectionRenderer!.viewportHandler.canvas.removeEventListener('click', this.selectionCanvasClickListener);
    }

    /**
     * Updates game tooltip information
     */
    public updateTooltip(): void {

        // Tile section
        const tileSectionVisible = this.highlightedTile !== undefined;
        UIManager.tooltipTileSectionElement.setVisibility(tileSectionVisible);
        if (tileSectionVisible) {
            UIManager.tooltipTileCoordinatesElement.text(`${this.highlightedLocation[0]}, ${this.highlightedLocation[1]}`);
            UIManager.tooltipTileNameElement.text(this.highlightedTile![0].descriptor.name);
            UIManager.tooltipTileTraversableElement.text(this.highlightedTile![0].traversable ? '✓' : '✗');
        }

        // Ship section
        const ship = this._heldShip ?? this.highlightedTile?.[2];
        const shipSectionVisible = ship !== undefined;
        UIManager.tooltipShipSectionElement.setVisibility(shipSectionVisible);
        if (shipSectionVisible) {
            UIManager.tooltipShipNameElement.text(ship!.descriptor.name);
            UIManager.tooltipShipOwnerElement.text(ship!.player.name);
        }

        // Update overall tooltip visibility
        const tooltipVisible = tileSectionVisible || shipSectionVisible;
        UIManager.tooltipElement.setVisibility(tooltipVisible);
    }

    /**
     * Updates all information on the sidebar
     */
    public updateSidebar(): void {

        // Ship section
        const shipSectionVisible = this._selectedShip !== undefined;
        UIManager.sidebarShipSection.setVisibility(shipSectionVisible);
        if (shipSectionVisible) {
            UIManager.sidebarShipNameElement.text(this._selectedShip!.descriptor.name);
            UIManager.sidebarShipOwnerElement.text(this._selectedShip!.player.name);
            UIManager.sidebarShipDescriptionElement.text(this._selectedShip!.descriptor.description);
        }
    }

    /**
     * Moves the game tooltip to follow the cursor
     *
     * @param  x X coordinate of cursor
     * @param  y Y coordinate of cursor
     */
    protected moveTooltip(x: number, y: number): void {
        UIManager.tooltipElement.element.get(0).style.left = `${x + 5}px`;
        UIManager.tooltipElement.element.get(0).style.top = `${y + 5}px`;
    }

    /**
     * Updates the location of the current selection and determines what is being highlighted
     *
     * @param  ev Pointer movement event
     */
    protected updateSelection(ev: PointerEvent): void {
        const renderer = game.gameRenderer!;
        const [ canvasX, canvasY ] = renderer.viewportHandler.screenToCanvasCoordinates(ev.clientX, ev.clientY);
        const [ x, y ] = renderer.viewportHandler.canvasToBoardCoordinates(canvasX, canvasY, game.board!);
        renderer.selectionInfoGenerator.setOffset(x, y);
        renderer.selectionInfoGenerator.push();

        if (ev.target === renderer.viewportHandler.canvas) {
            this.highlightedLocationRaw = [x, y];
            this.highlightedLocation = [Math.floor(x), Math.floor(y)];
            this.highlightedTile = game.board!.tiles[Math.floor(y)]?.[Math.floor(x)];
        } else {
            this.highlightedLocationRaw = [-Infinity, -Infinity];
            this.highlightedLocation = [-Infinity, -Infinity];
            this.highlightedTile = undefined;
        }
    }

    /**
     * Called when the pointer is moved across the screen
     *
     * @param  ev Pointer movement event to handle
     */
    protected onPointerMove(ev: PointerEvent): void {
        this.moveTooltip(ev.x, ev.y);
        this.updateSelection(ev);
        this.updateTooltip();
    }

    protected onMainCanvasClick(): void {}
    protected onSelectionCanvasClick(): void {}

    /**
     * Getters and setters
     */

    public static get currentManager(): UIManager | undefined {
        return this._currentManager;
    }
}
