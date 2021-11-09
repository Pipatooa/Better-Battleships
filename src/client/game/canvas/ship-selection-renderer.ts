import { selfPlayer } from '../player';
import type { Ship } from '../scenario/ship';
import type { GameRenderer } from './game-renderer';
import { PatternRenderer } from './pattern-renderer';

export let shipSelectionRenderer: ShipSelectionRenderer;

/**
 * ShipSelectionRenderer - Client Version
 *
 * Responsible for rendering ships to the ship selection canvas
 */
export class ShipSelectionRenderer {

    private selectedIndex = 0;
    private readonly patternRenderers: [boolean, PatternRenderer][] = [];

    private readonly largestShipSize: number = 0;

    /**
     * ShipSelectionRenderer constructor
     *
     * @param  renderer Base renderer for canvas functions
     * @param  ships    List of ships which are displayed within the ship selection window
     */
    public constructor(public readonly renderer: GameRenderer,
                       public readonly ships: Ship[]) {

        // Create pattern renderers for each of the ships
        for (const ship of this.ships) {

            // Create renderers to render ship to selection window and main game screen
            const selectionPatternRenderer = new PatternRenderer(this.renderer, this.renderer.shipSelectionCanvas, ship.pattern,
                selfPlayer.color!, selfPlayer.team!.color);

            // Store renderers to list of renderers
            this.patternRenderers.push([false, selectionPatternRenderer]);

            // Update largest ship size
            let [xMax, yMax] = ship.pattern.getBounds();
            this.largestShipSize = Math.max(this.largestShipSize, xMax + 1, yMax + 1);
        }

        // Register button handlers
        $('#button-previous-ship').on('click', () => this.previousShip());
        $('#button-next-ship').on('click', () => this.nextShip());
        this.renderer.shipSelectionCanvas.canvas.addEventListener('click', () => this.selectCurrent());

        this.redrawAll();
    }

    /**
     * Called when the pointer is moved
     *
     * @param  ev Pointer movement event
     */
    private onPointerMove(ev: PointerEvent): void {

        // Convert mouse coordinates to board coordinates
        const [pixelX, pixelY] = this.renderer.shipCanvas.translateMouseCoordinatePixel(ev.x, ev.y);
        const [boardX, boardY] = this.renderer.boardRenderer.translatePixelCoordinateBoard(pixelX, pixelY);

        this.ships[this.selectedIndex].x = boardX;
        this.ships[this.selectedIndex].y = boardY;

        this.renderer.shipRenderer.redrawAll();
    }

    /**
     * Renders ships to the ship selection screen
     */
    public redrawAll(): void {
        let canvasInfo = this.renderer.shipSelectionCanvas;

        // Clear the canvas
        canvasInfo.context.clearRect(0, 0, canvasInfo.canvas.width, canvasInfo.canvas.height);

        // Check if ship is still available to draw
        if (this.ships.length === 0)
            return;

        // Calculate where ship should appear within window
        const ratio = 0.75;
        const cellWidth = canvasInfo.canvas.width / this.largestShipSize * ratio;
        const drawX = canvasInfo.canvas.width * (1 - ratio) * 0.5;
        const drawY = canvasInfo.canvas.height * (1 - ratio) * 0.5;

        // Render ship to the selection canvas
        const patternRendererInfo = this.patternRenderers[this.selectedIndex];
        patternRendererInfo[1].render(drawX, drawY, cellWidth, 0);
    }

    /**
     * Called when the previous ship button is hit
     */
    private previousShip(): void {

        if (this.ships.length === 0)
            return;

        // De-render old ship
        this.ships[this.selectedIndex].doRender = false;
        this.ships[this.selectedIndex].patternRenderer!.deRender();

        // Unusual mod function so that -1 % n returns n - 1 and not -1
        this.selectedIndex = (this.selectedIndex + this.ships.length - 1) % this.ships.length;

        // Render new ship
        this.ships[this.selectedIndex].doRender = true;
        this.redrawAll();
    }

    /**
     * Called when the next ship button is hit
     */
    private nextShip(): void {

        if (this.ships.length === 0)
            return;

        // De-render old ship
        this.ships[this.selectedIndex].doRender = false;
        this.ships[this.selectedIndex].patternRenderer!.deRender();

        this.selectedIndex++;
        this.selectedIndex %= this.ships.length;

        // Render new ship
        this.ships[this.selectedIndex].doRender = true;
        this.redrawAll();
    }
    
    /**
     * Called when the user clicks on the current ship
     */
    public selectCurrent(): void {

        // Pop ship and pattern renderer at selected index
        const ship = this.ships.splice(this.selectedIndex, 1)[0];
        this.patternRenderers.splice(this.selectedIndex, 1);

        // Set selected ship to popped ship
        this.renderer.selectedShipRenderer.selectShip(ship);

        // If no ships are remaining, reveal done button
        if (this.ships.length === 0) {
            $('#button-previous-container, #button-next-container').addClass('d-none');
            $('#button-placement-done').removeClass('d-none');
        }

        // Rerender available ships
        this.redrawAll();
    }
}
