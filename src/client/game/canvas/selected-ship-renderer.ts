import { game } from '../game';
import { Pattern, PatternEntry } from '../scenario/pattern';
import { findShip, Ship } from '../scenario/ship';
import { GameRenderer } from './game-renderer';
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

    /**
     * SelectedShipRenderer constructor
     *
     * @param  renderer Base renderer for canvas functions
     */
    public constructor(public readonly renderer: GameRenderer) {
        
        // Create a single cell pattern renderer for the currently highlighted grid cell
        const singleCellPattern = new Pattern([new PatternEntry(0, 0, 1)], [0, 0]);
        this.highlightedCellRenderer = new PatternRenderer(this.renderer, this.renderer.selectedShipCanvas, singleCellPattern, '#dddddd', '#dddddd');

        // Register event listeners
        this.renderer.topCanvas.canvas.addEventListener('pointermove', (ev) => this.onPointerMove(ev));
        this.renderer.topCanvas.canvas.addEventListener('pointerleave', () => this.onPointerLeave());
        this.renderer.topCanvas.canvas.addEventListener('pointerdown', () => this.onPointerDown());
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
        const [pixelX, pixelY] = this.renderer.selectedShipCanvas.translateMouseCoordinatePixel(ev.x, ev.y);
        const [boardX, boardY] = this.renderer.boardRenderer.translatePixelCoordinateBoard(pixelX, pixelY);

        if (boardX === this.highlightedX && boardY === this.highlightedY)
            return;

        this.highlightedX = boardX;
        this.highlightedY = boardY;

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
            this.selectedShip.doRender = true;
            this.selectedShip = undefined;
            this.selectedShipRenderer!.deRender();
            this.selectedShipRenderer!.deconstruct();
            this.selectedShipRenderer = undefined;

            // Redraw ships
            this.updateInfoPane();
            this.renderer.shipRenderer.redrawAll();
            return;
        }

        if (this.highlightedShip === undefined)
            return;

        this.setSelected(this.highlightedShip);
        this.updateInfoPane();
        this.render();

        // De-render ship from ship canvas
        if (this.placementMode) {
            this.selectedShip!.doRender = false;
            this.selectedShip!.patternRenderer!.deRender();
        }
    }

    /**
     * Sets the currently selected ship
     *
     * @param  ship Ship to select
     */
    public setSelected(ship: Ship): void {
        this.selectedShip = ship;
        this.updateInfoPane();

        // Create a new renderer for the selected ship
        const fillColor = this.placementMode ? ship.player.color! : '#fff';
        const borderColor = this.placementMode ? ship.player.team!.color : '#fff';
        this.selectedShipRenderer = new PatternRenderer(this.renderer, this.renderer.selectedShipCanvas, ship.pattern, fillColor, borderColor);
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
        }

        // Update overall tooltip visibility
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
        const [boardSizeX, boardSizeY] = game.board!.size;
        const tileSectionVisible = this.highlightedX >= 0 && this.highlightedX < boardSizeX && this.highlightedY >= 0 && this.highlightedY < boardSizeY;
        this.tooltipTileSectionElement.setVisibility(tileSectionVisible);
        if (tileSectionVisible) {
            const tileType = game.board!.tiles[this.highlightedY][this.highlightedX].tileType;
            this.tooltipTileCoordinatesElement.text(`${this.highlightedX}, ${this.highlightedY}`);
            this.tooltipTileNameElement.text(tileType.descriptor.name);
            this.tooltipTileTraversableElement.text(tileType.traversable ? '✓' : '✗');
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
        this.renderer.selectedShipCanvas.context.clearRect(0, 0, this.renderer.selectedShipCanvas.canvas.width, this.renderer.selectedShipCanvas.canvas.height);

        // Call regular renderer
        this.render();
    }

    /**
     * Renders the highlighted ship or cell to the canvas
     */
    public render(): void {

        // Draw highlighted grid cell to canvas
        const [drawX, drawY] = this.renderer.boardRenderer.translateBoardCoordinatePixel(this.highlightedX, this.highlightedY);
        this.highlightedCellRenderer.render(drawX, drawY, this.renderer.boardRenderer.gridCellSize, 0, 0.2);

        // Draw selected ship to canvas
        if (this.selectedShip !== undefined) {
            const [ shipDrawX, shipDrawY ] = this.renderer.boardRenderer.translateBoardCoordinatePixel(this.selectedShip.x, this.selectedShip.y);
            const alpha = this.placementMode ? 1 : 0.1;
            this.selectedShipRenderer!.render(shipDrawX, shipDrawY, this.renderer.boardRenderer.gridCellSize, 0, alpha);
        }
    }
}
