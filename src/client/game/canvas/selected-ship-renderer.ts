import { game } from '../game';
import { Pattern, PatternEntry } from '../scenario/pattern';
import type { Ship } from '../scenario/ship';
import { findShip } from '../scenario/ship';
import type { TileType } from '../scenario/tiletype';
import type { GameRenderer } from './game-renderer';
import { PatternRenderer } from './pattern-renderer';
import { VariableVisibilityElement } from './variable-visibility-element';

/**
 * SelectedShipRenderer - Client Version
 *
 * Responsible for rendering selected ships and the currently highlighted cell
 *
 * Also responsible for updating the information display for the currently selected ship
 */
export class SelectedShipRenderer {

    private highlightedX = -Infinity;
    private highlightedY = -Infinity;
    private highlightedTileType: TileType | undefined;
    private highlightedShip: Ship | undefined;
    private readonly highlightedCellRenderer: PatternRenderer;
    
    private readonly selectedX = -Infinity;
    private readonly selectedY = -Infinity;
    private selectedShip: Ship | undefined;
    private selectedShipRenderer: PatternRenderer | undefined;

    public placementMode = true;

    // Tooltip
    private readonly tooltipElement = new VariableVisibilityElement($('#game-tooltip'));

    private readonly tooltipTileSectionElement = new VariableVisibilityElement($('#game-tooltip-tile-section'));
    private readonly tooltipTileCoordinatesElement = $('#game-tooltip-tile-coordinates');
    private readonly tooltipTileNameElement = $('#game-tooltip-tile-name');
    private readonly tooltipTileTraversableElement = $('#game-tooltip-tile-traversable');

    private readonly tooltipShipSectionElement = new VariableVisibilityElement($('#game-tooltip-ship-section'));
    private readonly tooltipShipNameElement = $('#game-tooltip-ship-name');
    private readonly tooltipShipOwnerElement = $('#game-tooltip-ship-owner');

    // Info pane
    private readonly infoPaneElement = new VariableVisibilityElement($('#info-pane'));
    private readonly shipSelectionPaneElement = new VariableVisibilityElement($('#ship-selection-pane'));

    private readonly infoPaneShipSectionElement = new VariableVisibilityElement($('#info-pane-ship-section'));
    private readonly infoPaneShipNameElement = $('#info-pane-ship-name');
    private readonly infoPaneShipOwnerElement = $('#info-pane-ship-owner');
    private readonly infoPaneShipDescriptionElement = $('#info-pane-ship-description');

    private readonly infoPaneShipAbilityContainer = $('#info-pane-ship-ability-container');

    /**
     * SelectedShipRenderer constructor
     *
     * @param  renderer Base renderer for canvas functions
     */
    public constructor(public readonly renderer: GameRenderer) {
        
        // Create a single cell pattern renderer for the currently highlighted grid cell
        const singleCellPattern = new Pattern([new PatternEntry(0, 0, 1)], [0, 0]);
        this.highlightedCellRenderer = new PatternRenderer(this.renderer, this.renderer.mainCanvas, this.renderer.mainCanvas.contexts.selected, singleCellPattern, '#dddddd', '#dddddd');

        // Register event listeners
        this.renderer.mainCanvas.wrapperHTMLElement.addEventListener('pointermove', (ev) => this.onPointerMove(ev));
        this.renderer.mainCanvas.wrapperHTMLElement.addEventListener('pointerleave', () => this.onPointerLeave());
        this.renderer.mainCanvas.wrapperHTMLElement.addEventListener('pointerdown', () => this.onPointerDown());
    }

    /**
     * Called when the pointer is moved across the canvas
     *
     * @param  ev Pointer movement event
     */
    public onPointerMove(ev: PointerEvent): void {

        // Move tooltip
        this.tooltipElement.element.get(0).style.left = `${ev.x + 5}px`;
        this.tooltipElement.element.get(0).style.top = `${ev.y + 5}px`;

        // If mouse is being held, do not recalculate selected cell
        if (ev.buttons !== 0)
            return;

        // Convert mouse coordinates to board coordinates
        const [pixelX, pixelY] = this.renderer.mainCanvas.translateMouseCoordinatePixel(ev.x, ev.y);
        const [boardX, boardY] = this.renderer.boardRenderer.translatePixelCoordinateBoard(pixelX, pixelY);

        if (boardX === this.highlightedX && boardY === this.highlightedY)
            return;

        this.highlightedX = boardX;
        this.highlightedY = boardY;

        const [boardSizeX, boardSizeY] = game.board!.size;
        if (boardX >= 0 && boardX < boardSizeX && boardY >= 0 && boardY < boardSizeY)
            this.highlightedTileType = game.board!.tiles[boardY][boardX][0];
        else
            this.highlightedTileType = undefined;

        // If in placement mode, move selected ship
        if (this.placementMode && this.selectedShip !== undefined) {
            this.selectedShip.x = boardX;
            this.selectedShip.y = boardY;
        }

        // Find ship at location
        this.highlightedShip = findShip(this.highlightedX, this.highlightedY);

        this.updateTooltip();
        this.render();
    }

    /**
     * Called when the pointer is moved outside of the canvas
     */
    public onPointerLeave(): void {
        this.highlightedX = -Infinity;
        this.highlightedY = -Infinity;

        if (this.placementMode && this.selectedShip !== undefined) {
            this.selectedShip.x = -Infinity;
            this.selectedShip.y = -Infinity;
        }

        this.tooltipElement.setVisibility(false);
        this.render();
    }

    /**
     * Called when the pointer is pressed
     */
    public onPointerDown(): void {

        // Deselect / place ship
        if (this.selectedShip !== undefined) {

            if (this.placementMode) {
                this.selectedShipRenderer!.deRender();
                this.selectedShipRenderer!.deconstruct();
                this.selectedShip.doRender = true;
                this.selectedShip.patternRenderer!.reRender();

                this.selectedShipRenderer = undefined;
            } else {
                this.selectedShip.patternRenderer!.fillColor = this.selectedShip.player.color!;
                this.selectedShip.patternRenderer!.borderColor = this.selectedShip.player.team!.color;
                this.selectedShip.patternRenderer!.reRender();
            }

            const oldSelectedShip = this.selectedShip;
            this.selectedShip = undefined;

            // Redraw ships
            this.updateInfoPane();
            this.renderer.shipRenderer.redrawAll();

            // If we are hovering over the same ship, do not continue to reselect ship
            if (this.highlightedShip == oldSelectedShip)
                return;
        }

        if (this.highlightedShip === undefined)
            return;

        this.selectShip(this.highlightedShip);
        this.updateInfoPane();
    }

    /**
     * Sets the currently selected ship
     *
     * @param  ship Ship to select
     */
    public selectShip(ship: Ship): void {
        this.selectedShip = ship;
        this.updateInfoPane();

        // Create a new renderer for the selected ship
        if (this.placementMode) {
            this.selectedShip.doRender = false;
            this.selectedShip.patternRenderer!.deRender();
            this.selectedShipRenderer = new PatternRenderer(this.renderer, this.renderer.mainCanvas, this.renderer.mainCanvas.contexts.selected, ship.pattern, ship.player.color!, ship.player.team!.color);
            this.render();
        } else {
            this.selectedShip.patternRenderer!.fillColor = ship.player.highlightColor!;
            this.selectedShip.patternRenderer!.borderColor = ship.player.team!.highlightColor;
            this.selectedShip.patternRenderer!.reRender();
        }
    }

    /**
     * Updates the info pane with relevant information
     */
    public updateInfoPane(): void {

        // Ship section
        const shipSectionVisible = this.selectedShip !== undefined;
        this.infoPaneShipSectionElement.setVisibility(shipSectionVisible);
        if (shipSectionVisible) {
            this.infoPaneShipNameElement.text(this.selectedShip!.descriptor.name);
            this.infoPaneShipOwnerElement.text(this.selectedShip!.player.name);
            this.infoPaneShipDescriptionElement.text(this.selectedShip!.descriptor.description);

            this.infoPaneShipAbilityContainer.children().remove();
            for (const ability of this.selectedShip!.abilities) {
                ability.createGameElement(this.infoPaneShipAbilityContainer);
            }
        }

        // Update overall info pane visibility
        if (this.placementMode) {
            const infoPaneVisible = this.selectedShip !== undefined;
            this.infoPaneElement.setVisibility(infoPaneVisible);
            this.shipSelectionPaneElement.setVisibility(!infoPaneVisible);
        }
    }

    /**
     * Updates information for the game tooltip
     */
    private updateTooltip(): void {

        // Tile section
        const tileSectionVisible = this.highlightedTileType !== undefined;
        this.tooltipTileSectionElement.setVisibility(tileSectionVisible);
        if (tileSectionVisible) {
            this.tooltipTileCoordinatesElement.text(`${this.highlightedX}, ${this.highlightedY}`);
            this.tooltipTileNameElement.text(this.highlightedTileType!.descriptor.name);
            this.tooltipTileTraversableElement.text(this.highlightedTileType!.traversable ? '✓' : '✗');
        }

        // Ship section
        const shipSectionVisible = this.highlightedShip !== undefined;
        this.tooltipShipSectionElement.setVisibility(shipSectionVisible);
        if (shipSectionVisible) {
            this.tooltipShipNameElement.text(this.highlightedShip!.descriptor.name);
            this.tooltipShipOwnerElement.text(this.highlightedShip!.player.name);
        }

        // Update overall tooltip visibility
        const tooltipVisible = tileSectionVisible || shipSectionVisible;
        this.tooltipElement.setVisibility(tooltipVisible);
    }

    /**
     * Re-renders entire canvas
     */
    public redrawAll(): void {

        // Clear canvas
        this.renderer.mainCanvas.contexts.selected.clearRect(0, 0, this.renderer.mainCanvas.width, this.renderer.mainCanvas.height);

        // Call regular renderer
        this.render();
    }

    /**
     * Renders the highlighted ship or cell to the canvas
     */
    public render(): void {
        if (this.selectedShip !== undefined && this.placementMode) {
            // Draw selected ship to canvas
            const [ shipDrawX, shipDrawY ] = this.renderer.boardRenderer.translateBoardCoordinatePixel(this.selectedShip.x, this.selectedShip.y);
            this.selectedShipRenderer!.render(shipDrawX, shipDrawY, this.renderer.boardRenderer.gridCellSize, 0);
        } else {
            // Draw highlighted cell
            const [drawX, drawY] = this.renderer.boardRenderer.translateBoardCoordinatePixel(this.highlightedX, this.highlightedY);
            this.highlightedCellRenderer.render(drawX, drawY, this.renderer.boardRenderer.gridCellSize, 0, 0.2);
        }
    }
}
