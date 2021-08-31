import { clamp } from '../../../shared/utility';
import { Board } from '../scenario/board';
import { GameRenderer } from './game-renderer';

/**
 * BoardRenderer - Client Version
 *
 * Responsible for rendering the board to game canvases
 */
export class BoardRenderer {

    protected gridCellSize: number;
    protected gridOffsetX: number;
    protected gridOffsetY: number;

    protected gridSizePixelsX: number;
    protected gridSizePixelsY: number;

    protected readonly gridCellSizeLowerBound: number;
    protected readonly gridCellSizeUpperBound: number;
    protected gridSep = 2;

    protected moving = false;
    protected lastMousePosition: [number, number] = [ 0, 0 ];
    
    /**
     * BoardRenderer constructor
     *
     * @param  renderer Base renderer for canvas functions
     * @param  board    Board object to draw to canvas
     */
    public constructor(protected readonly renderer: GameRenderer,
                       protected readonly board: Board) {

        // Constants for calculating zoom bounds
        const zoomBoundMultiplier = 1.5;
        const zoomBoundMinTiles = 10;

        // Calculate limits for grid cell rendering
        this.gridCellSizeLowerBound = Math.min(
            this.renderer.boardCanvas.canvas.width / this.board.size[0] / zoomBoundMultiplier,
            this.renderer.boardCanvas.canvas.height / this.board.size[1] / zoomBoundMultiplier
        );
        this.gridCellSizeUpperBound = Math.min(this.renderer.boardCanvas.canvas.width, this.renderer.boardCanvas.canvas.height) / zoomBoundMinTiles;

        // Register event listeners
        this.renderer.boardCanvas.canvas.addEventListener('wheel', (ev: WheelEvent) => this.onScroll(ev));

        // Set default view
        this.gridCellSize = (this.gridCellSizeLowerBound + this.gridCellSizeUpperBound) / 2;
        this.gridOffsetX = (this.renderer.boardCanvas.canvas.width - this.board.size[0] * this.gridCellSize) / 2;
        this.gridOffsetY = (this.renderer.boardCanvas.canvas.height - this.board.size[1] * this.gridCellSize) / 2;
        this.gridSizePixelsX = this.gridCellSize * this.board.size[0];
        this.gridSizePixelsY = this.gridCellSize * this.board.size[1];

        // Draw grid for first time
        this.redrawAll();

        // Register event listeners
        this.renderer.shipCanvas.canvas.addEventListener('wheel', (ev: WheelEvent) => this.onScroll(ev));
        $(document).on('pointermove', (ev) => this.onPointerMove(ev.originalEvent as PointerEvent));
        $(document).on('resize', () => this.redrawAll());
    }

    /**
     * Activated when the scroll wheel is used over the canvas
     *
     * @param  ev Mouse wheel event
     */
    private onScroll(ev: WheelEvent): void {

        // Check that scroll is targeting board or ship canvas
        if (! (ev.target as unknown === this.renderer.boardCanvas.canvas
            || ev.target as unknown === this.renderer.shipCanvas.canvas))
            return;

        // Prevent scrolling of page
        ev.preventDefault();

        const oldGridCellSize = this.gridCellSize;
        this.gridCellSize *= 1 - ev.deltaY * 0.001;
        this.constrainZoom();
        this.gridSizePixelsX = this.gridCellSize * this.board.size[0];
        this.gridSizePixelsY = this.gridCellSize * this.board.size[1];

        const deltaScaleFactor = this.gridCellSize / oldGridCellSize - 1;
        const [ pixelX, pixelY ] = this.renderer.boardCanvas.translateMouseCoordinatePixel(ev.x, ev.y);

        this.gridOffsetX -= (pixelX - this.gridOffsetX) * deltaScaleFactor;
        this.gridOffsetY -= (pixelY - this.gridOffsetY) * deltaScaleFactor;

        this.constrainOffsetXY();
        this.redrawAll();
    }

    /**
     * Activated when the pointer is moved across the canvas
     *
     * @param  ev Pointer event
     */
    private onPointerMove(ev: PointerEvent): void {

        // Mouse drag stop
        if (this.moving && ev.buttons === 0) {
            this.moving = false;
            return;
        }

        // Mouse drag start - Pointer must be targeting board or ship canvas
        if (!this.moving && (ev.target as unknown === this.renderer.boardCanvas.canvas 
                         || ev.target as unknown === this.renderer.shipCanvas.canvas)
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
        let dx = (ev.clientX - this.lastMousePosition[0]) * this.renderer.pixelScale;
        let dy = (ev.clientY - this.lastMousePosition[1]) * this.renderer.pixelScale;

        // Offset current grid position by delta, recording old offsets
        const oldGridOffsetX = this.gridOffsetX;
        const oldGridOffsetY = this.gridOffsetY;
        this.gridOffsetX += dx;
        this.gridOffsetY += dy;

        // Record new last mouse position
        this.lastMousePosition = [ ev.clientX, ev.clientY ];

        // Make sure new board position is valid
        this.constrainOffsetXY();

        // Calculate delta after xy has been constrained
        dx = this.gridOffsetX - oldGridOffsetX;
        dy = this.gridOffsetY - oldGridOffsetY;

        // Redraw the board
        this.redrawBoardMovement(dx, dy);
    }

    /**
     * Constrain zoom to lower and upper bound
     */
    private constrainZoom(): void {
        this.gridCellSize = clamp(this.gridCellSize, this.gridCellSizeLowerBound, this.gridCellSizeUpperBound);
    }

    /**
     * Constrain panning so that at least one cell of the grid is showing
     */
    private constrainOffsetXY(): void {
        this.gridOffsetX = clamp(this.gridOffsetX,
            -this.gridCellSize * (this.board.size[0] - 1),
            this.renderer.boardCanvas.canvas.width - this.gridCellSize);

        this.gridOffsetY = clamp(this.gridOffsetY,
            -this.gridCellSize * (this.board.size[1] - 1),
            this.renderer.boardCanvas.canvas.height - this.gridCellSize);
    }

    /**
     * Redraws the board after it has been moved
     *
     * @param  dx Delta X board has been moved by
     * @param  dy Delta Y board has been moved by
     */
    private redrawBoardMovement(dx: number, dy: number): void {

        // If no delta, ignore
        // This may be caused by board drags resulting in no actual movement of the board due to movement constraints
        if (dx === 0 && dy === 0)
            return;

        // Move all canvas elements by delta
        let boardData = this.renderer.boardCanvas.context.getImageData(0, 0, this.renderer.boardCanvas.canvas.width, this.renderer.boardCanvas.canvas.height);
        this.renderer.boardCanvas.context.putImageData(boardData, dx, dy);

        // Buffer amount - Number of pixels to expand redraw region by in all directions
        const bufferPixels = 10;
        const singleBufferedDx = Math.abs(dx) + bufferPixels;
        const singleBufferedDy = Math.abs(dy) + bufferPixels;
        const doubleBufferedDx = singleBufferedDx + bufferPixels;
        const doubleBufferedDy = singleBufferedDy + bufferPixels;

        // xStart, yStart - Left or Top of canvas | Top or Left of board
        // Whichever is closer to the center of the canvas
        let xStart = Math.max(0, this.gridOffsetX - singleBufferedDx);
        let yStart = Math.max(0, this.gridOffsetY - singleBufferedDy);

        // xEnd, yEnd - Right or Bottom of canvas | Right or Bottom of board
        // Whichever is closer to the center of the canvas
        let xEnd = Math.min(this.renderer.boardCanvas.canvas.width - singleBufferedDx, this.gridOffsetX + this.gridSizePixelsX - bufferPixels);
        let yEnd = Math.min(this.renderer.boardCanvas.canvas.height - singleBufferedDy, this.gridOffsetY + this.gridSizePixelsY - bufferPixels);

        // Region to left or right of board being moved
        if (dx !== 0)
            this.redrawRegion(dx > 0 ? xStart : xEnd, this.gridOffsetY - singleBufferedDy, doubleBufferedDx, this.gridSizePixelsY + doubleBufferedDy);

        // Region on top or bottom of board being moved
        if (dy !== 0)
            this.redrawRegion(this.gridOffsetX - singleBufferedDx, dy > 0 ? yStart : yEnd, this.gridSizePixelsX + doubleBufferedDx, doubleBufferedDy);

        // Corner region
        if (dx !== 0 && dy !== 0)
            this.redrawRegion(dx > 0 ? xStart : xEnd, dy > 0 ? yStart : yEnd, doubleBufferedDx, doubleBufferedDy);
    }
    
    /**
     * Redraws a region of the board
     *
     * @param  x Minimum x to draw from
     * @param  y Minimum y to draw from
     * @param  w Width of region to redraw
     * @param  h Height of region to redraw
     */
    public redrawRegion(x: number, y: number, w: number, h: number): void {

        // Clear region to be redrawn
        this.renderer.boardCanvas.context.clearRect(x, y, w, h);

        // Determine which tiles are within redraw bounds
        const gridXStart = clamp(Math.floor((x - this.gridOffsetX) / this.gridCellSize), 0, this.board.size[0] - 1);
        const gridYStart = clamp(Math.floor((y - this.gridOffsetY) / this.gridCellSize), 0, this.board.size[1] - 1);
        const gridXEnd = clamp(Math.floor((x + w - this.gridOffsetX) / this.gridCellSize), 0, this.board.size[0] - 1);
        const gridYEnd = clamp(Math.floor((y + h - this.gridOffsetY) / this.gridCellSize), 0, this.board.size[1] - 1);

        // Debug - Shows only redrawn regions
        // this.renderer.boardCanvas.context.clearRect(0, 0, this.renderer.boardCanvas.canvas.width, this.renderer.boardCanvas.canvas.height);
        // this.renderer.boardCanvas.context.fillStyle = '#ff0000';
        // this.renderer.boardCanvas.context.fillRect(x, y, w, h);

        // Redraw border for tiles
        let borderX = this.gridOffsetX + gridXStart * this.gridCellSize - this.gridSep;
        let borderY = this.gridOffsetY + gridYStart * this.gridCellSize - this.gridSep;
        let borderW = (gridXEnd - gridXStart + 1) * this.gridCellSize + this.gridSep;
        let borderH = (gridYEnd - gridYStart + 1) * this.gridCellSize + this.gridSep;
        this.renderer.boardCanvas.context.fillStyle = '#16246b';
        this.renderer.boardCanvas.context.fillRect(borderX, borderY, borderW, borderH);

        // Draw tiles to screen
        for (let y = gridYStart; y <= gridYEnd; y++) {
            const row = this.board.tiles[y];
            for (let x = gridXStart; x <= gridXEnd; x++) {
                const tile = row[x];

                this.renderer.boardCanvas.context.fillStyle = tile.tileType.color;
                this.renderer.boardCanvas.context.fillRect(
                    this.gridOffsetX + tile.x * this.gridCellSize,
                    this.gridOffsetY + tile.y * this.gridCellSize,
                    this.gridCellSize - this.gridSep,
                    this.gridCellSize - this.gridSep
                );
            }
        }
    }

    /**
     * Redraws the entire board
     */
    public redrawAll(): void {
        this.redrawRegion(0, 0, this.renderer.boardCanvas.canvas.width, this.renderer.boardCanvas.canvas.height);
    }
}
