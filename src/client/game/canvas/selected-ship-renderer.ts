import { game } from '../game';
import { Pattern, PatternEntry } from '../scenario/pattern';
import { findShip, Ship } from '../scenario/ship';
import { GameRenderer } from './game-renderer';
import { PatternRenderer } from './pattern-renderer';

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
    private readonly highlightedShip: Ship | undefined;
    private readonly highlightedCellRenderer: PatternRenderer;
    
    private readonly selectedX = -Infinity;
    private readonly selectedY = -Infinity;
    private selectedShip: Ship | undefined;
    private selectedShipRenderer: PatternRenderer | undefined;

    public placementMode = true;

    private readonly tooltipElement: JQuery = $('#game-tooltip');

    private readonly infoPaneElement: JQuery = $('#info-pane');
    private readonly shipSelectionPaneElement: JQuery = $('#ship-selection-pane');
    private infoPaneVisible = false;

    private readonly infoPaneTileSectionElement: JQuery = $('#info-pane-tile-section');
    private readonly infoPaneTileNameElement: JQuery = $('#info-pane-tile-name');
    private readonly infoPaneTileDescriptionElement: JQuery = $('#info-pane-tile-description');
    private infoPaneTileSectionVisible = false;

    private readonly infoPaneShipSectionElement: JQuery = $('#info-pane-ship-section');
    private readonly infoPaneShipNameElement: JQuery = $('#info-pane-ship-name');
    private readonly infoPaneShipDescriptionElement: JQuery = $('#info-pane-ship-description');
    private infoPaneShipSectionVisible = false;

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
        this.renderer.topCanvas.canvas.addEventListener('pointerenter', () => this.onPointerEnter());
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
        this.tooltipElement.get(0).style.left = `${ev.x + 5}px`;
        this.tooltipElement.get(0).style.top = `${ev.y + 5}px`;

        // If mouse is being held, do not recalculate selected cell
        if (ev.buttons !== 0)
            return;

        // Convert mouse coordinates to board coordinates
        const [pixelX, pixelY] = this.renderer.selectedShipCanvas.translateMouseCoordinatePixel(ev.x, ev.y);
        const [boardX, boardY] = this.renderer.boardRenderer.translatePixelCoordinateBoard(pixelX, pixelY);

        const oldHighlightedX = this.highlightedX;
        const oldHighlightedY = this.highlightedY;

        this.highlightedX = boardX;
        this.highlightedY = boardY;

        if (this.placementMode && this.selectedShip !== undefined) {
            this.selectedShip.x = boardX;
            this.selectedShip.y = boardY;
        }

        if (oldHighlightedX !== this.highlightedX || oldHighlightedY !== this.highlightedY) {
            this.updateInfoPane();
            this.render();
        }
    }

    /**
     * Called when the pointer is moved inside of the canvas
     */
    public onPointerEnter(): void {
        this.tooltipElement.removeClass('d-none');
    }

    /**
     * Called when the pointer is moved outside of the canvas
     */
    public onPointerLeave(): void {
        this.tooltipElement.addClass('d-none');

        this.highlightedX = -Infinity;
        this.highlightedY = -Infinity;

        if (this.placementMode && this.selectedShip !== undefined) {
            this.selectedShip.x = -Infinity;
            this.selectedShip.y = -Infinity;
        }

        this.updateInfoPane();
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
            this.selectedShipRenderer!.deconstruct();
            this.selectedShipRenderer = undefined;

            // Redraw ships
            this.renderer.shipRenderer.redrawAll();
            return;
        }

        // Find ship at location
        let ship: Ship | null = findShip(this.highlightedX, this.highlightedY);

        // If no ship found
        if (ship === null)
            return;

        // Select ship if one was found at location
        this.setSelected(ship);
        this.render();

        // De-render ship from ship canvas
        this.selectedShip!.doRender = false;
        this.selectedShip!.patternRenderer!.deRender();
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
        this.selectedShipRenderer = new PatternRenderer(this.renderer, this.renderer.selectedShipCanvas, ship.pattern, ship.player.color!, ship.player.team!.color);
    }

    /**
     * Updates the info pane with relevant information
     */
    public updateInfoPane(): void {

        // Update tile information
        const [boardSizeX, boardSizeY] = game.board!.size;
        if (this.highlightedX >= 0 && this.highlightedX < boardSizeX && this.highlightedY >= 0 && this.highlightedY < boardSizeY) {

            // Make pane visible
            if (!this.infoPaneTileSectionVisible) {
                this.infoPaneTileSectionElement.removeClass('d-none');
                this.infoPaneTileSectionVisible = true;
            }

            // Get currently selected tile
            const tileType = game.board!.tiles[this.highlightedY][this.highlightedX].tileType;

            // Update tile information
            this.infoPaneTileNameElement.text(tileType.descriptor.name);
            this.infoPaneTileDescriptionElement.text(tileType.descriptor.description);

        } else {
            // Make pane invisible
            if (this.infoPaneTileSectionVisible) {
                this.infoPaneTileSectionElement.addClass('d-none');
                this.infoPaneTileSectionVisible = false;
            }
        }

        // Update ship information
        if (this.selectedShip !== undefined) {

            // Make pane visible
            if (!this.infoPaneShipSectionVisible) {
                this.infoPaneShipSectionElement.removeClass('d-none');
                this.infoPaneShipSectionVisible = true;
            }

            // Update ship information
            this.infoPaneShipNameElement.text(this.selectedShip.descriptor.name);
            this.infoPaneShipDescriptionElement.text(this.selectedShip.descriptor.description);

        } else {
            // Make pane invisible
            if (this.infoPaneShipSectionVisible) {
                this.infoPaneShipSectionElement.addClass('d-none');
                this.infoPaneShipSectionVisible = false;
            }
        }

        // If in placement mode, change info pane visibility if necessary
        if (this.placementMode && this.selectedShip !== undefined && !this.infoPaneVisible) {
            this.infoPaneElement.removeClass('d-none');
            this.shipSelectionPaneElement.addClass('d-none');
            this.infoPaneVisible = true;
        } else if (this.placementMode && this.selectedShip === undefined && this.infoPaneVisible) {
            this.infoPaneElement.addClass('d-none');
            this.shipSelectionPaneElement.removeClass('d-none');
            this.infoPaneVisible = false;
        }
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
            this.selectedShipRenderer!.render(shipDrawX, shipDrawY, this.renderer.boardRenderer.gridCellSize, 0);
        }
    }
}