import { game } from '../game';
import { BoardRenderer } from './board-renderer';
import { CanvasInfo } from './canvas-info';
import { ShipRenderer } from './ship-renderer';
import { ShipSelectionRenderer } from './ship-selection-renderer';

export let gameRenderer: GameRenderer;

/**
 * GameRenderer - Client Version
 *
 * Base class for rendering objects to the canvas
 */
export class GameRenderer {
    
    public readonly boardCanvas: CanvasInfo;
    public readonly shipCanvas: CanvasInfo;
    public readonly shipSelectionCanvas: CanvasInfo;
    
    public readonly boardRenderer: BoardRenderer;
    public readonly shipRenderer: ShipRenderer;
    public readonly shipSelectionRenderer: ShipSelectionRenderer;

    protected _pixelScale = 1;

    protected moving = false;
    protected lastMousePosition: [number, number] = [ 0, 0 ];

    /**
     * GameRenderer constructor
     *
     * Initialises all canvases and renderers
     */
    public constructor() {

        let boardCanvasElement = $('#board-canvas').get(0) as HTMLCanvasElement;
        let shipCanvasElement = $('#ship-canvas').get(0) as HTMLCanvasElement;
        let shipSelectionCanvasElement = $('#ship-selection-canvas').get(0) as HTMLCanvasElement;

        this.boardCanvas = new CanvasInfo(boardCanvasElement, this._pixelScale);
        this.shipCanvas = new CanvasInfo(shipCanvasElement, this._pixelScale);
        this.shipSelectionCanvas = new CanvasInfo(shipSelectionCanvasElement, this._pixelScale);
        
        // Create renderers
        this.boardRenderer = new BoardRenderer(this, game.board!);
        this.shipRenderer = new ShipRenderer(this);
        this.shipSelectionRenderer = new ShipSelectionRenderer(this, game.availableShips!);

        // Register event listeners
        $(window).on('resize', () => this.onResize());
        $(document).on('pointermove', (ev) => this.onPointerMove(ev.originalEvent as PointerEvent));
    }

    /**
     * Called when window is resized
     */
    private onResize(): void {
        this.boardCanvas.onResize();
        this.shipCanvas.onResize();
        this.shipSelectionCanvas.onResize();

        this.boardRenderer.redrawAll();
        this.shipRenderer.redrawAll();
        this.shipSelectionRenderer.render();
    }

    /**
     * Called when the pointer is moved
     *
     * @param  ev Pointer event for movement
     */
    private onPointerMove(ev: PointerEvent): void {

        // Mouse drag stop
        if (this.moving && ev.buttons === 0) {
            this.moving = false;
            return;
        }

        // Mouse drag start - Pointer must be targeting board or ship canvas
        if (!this.moving && (ev.target as unknown === this.boardCanvas.canvas
                         || ev.target as unknown === this.shipCanvas.canvas)
        ) {
            this.moving = true;
            this.lastMousePosition = [ ev.clientX, ev.clientY ];
            ev.preventDefault();
            return;
        }

        // If mouse is not being dragged, do not execute rest of this code
        if (!this.moving)
            return;

        // Prevents unwanted highlighting etc
        ev.preventDefault();

        // Calculate movement delta - ev.movement is inconsistent between browsers
        let dx = (ev.clientX - this.lastMousePosition[0]) * this._pixelScale;
        let dy = (ev.clientY - this.lastMousePosition[1]) * this._pixelScale;

        // Record new last mouse position
        this.lastMousePosition = [ ev.clientX, ev.clientY ];

        // Apply movement delta to board
        [dx, dy] = this.boardRenderer.applyMovementDelta(dx, dy);

        // If no delta, ignore
        // This may be caused by board drags resulting in no actual movement of the board due to movement constraints
        if (dx === 0 && dy === 0)
            return;

        // Move canvas pixel data by delta
        this.boardCanvas.movePixelData(dx, dy);
        this.shipCanvas.movePixelData(dx, dy);

        // Calculate regions which need to be redrawn after movement
        const regions = this.calculateViewportMovementRedrawRegions(dx, dy);

        // Redraw all regions
        for (const [x, y, w, h] of regions) {
            this.boardRenderer.redrawRegion(x, y, w, h);
            this.shipRenderer.redrawRegion(x, y, w, h);
        }
    }

    /**
     * Calculates areas which need to be redrawn after a viewport movement
     *
     * @param    dx Horizontal distance viewport has been moved
     * @param    dy Vertical distance viewport has been moved
     * @returns     List of regions that need to be redrawn
     */
    public calculateViewportMovementRedrawRegions(dx: number, dy: number): [number, number, number, number][] {

        // Buffer amount - Number of pixels to expand redraw region by in all directions
        const bufferPixels = 5;

        let regions: [number, number, number, number][] = [];

        // Region to left or right of board being moved
        if (dx > 0)
            regions.push([0, 0, bufferPixels + dx, this.boardCanvas.canvas.height]);
        else if (dx < 0)
            regions.push([this.boardCanvas.canvas.width - bufferPixels + dx, 0, bufferPixels - dx, this.boardCanvas.canvas.height]);

        // Region on top or bottom of board being moved
        if (dy > 0)
            regions.push([0, 0, this.boardCanvas.canvas.width, bufferPixels + dy]);
        else if (dy < 0)
            regions.push([0, this.boardCanvas.canvas.height - bufferPixels + dy, this.boardCanvas.canvas.width, bufferPixels - dy]);

        // Corner region
        // ....

        return regions;
    }

    /**
     * Getters and setters
     */

    public get pixelScale(): number {
        return this._pixelScale;
    }
}

/**
 * Creates singleton GameRenderer
 */
export function initGameRenderer(): void {
    gameRenderer = new GameRenderer();
}
