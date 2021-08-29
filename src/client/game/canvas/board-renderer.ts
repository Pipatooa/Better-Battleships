import { clamp } from '../../../shared/utility';
import { Board } from '../scenario/board';
import { BaseRenderer } from './base-renderer';


/**
 * BoardRenderer - Client Version
 *
 * Responsible for rendering the board to the main canvas
 */
export class BoardRenderer {

    protected gridCellSize = 10;
    protected gridOffsetX = 0;
    protected gridOffsetY = 0;

    protected readonly gridCellSizeLowerBound: number;
    protected readonly gridCellSizeUpperBound: number;

    protected moving = false;
    protected lastMousePosition: [number, number] = [ 0, 0 ];

    /**
     * BoardRenderer constructor
     *
     * @param  renderer Base renderer for canvas functions
     * @param  board    Board object to draw to canvas
     */
    public constructor(protected readonly renderer: BaseRenderer,
                       protected readonly board: Board) {

        // Constants for calculating zoom bounds
        const zoomBoundMultiplier = 1.5;
        const zoomBoundMinTiles = 10;

        // Calculate limits for grid cell rendering
        this.gridCellSizeLowerBound = Math.min(
            this.renderer.canvas.width / this.board.size[0] / zoomBoundMultiplier,
            this.renderer.canvas.height / this.board.size[1] / zoomBoundMultiplier
        );
        this.gridCellSizeUpperBound = Math.min(this.renderer.canvas.width, this.renderer.canvas.height) / zoomBoundMinTiles;

        // Register event listeners
        this.renderer.canvas.addEventListener('wheel', (ev: WheelEvent) => this.onScroll(ev));
        $(document).on('pointermove', (ev) => this.onPointerMove(ev.originalEvent as PointerEvent));

        // Set default view
        this.gridCellSize = (this.gridCellSizeLowerBound + this.gridCellSizeUpperBound) / 2;
        this.gridOffsetX = (this.renderer.canvas.width - this.board.size[0] * this.gridCellSize) / 2;
        this.gridOffsetY = (this.renderer.canvas.height - this.board.size[1] * this.gridCellSize) / 2;

        // Draw grid for first time
        this.draw();
    }

    /**
     * Activated when the scroll wheel is used over the canvas
     *
     * @param  ev Mouse wheel event
     */
    private onScroll(ev: WheelEvent): void {

        // Prevent scrolling of page
        ev.preventDefault();

        //
        const oldGridCellSize = this.gridCellSize;
        this.gridCellSize *= 1 - ev.deltaY * 0.001;
        this.constrainZoom();

        const deltaScaleFactor = this.gridCellSize / oldGridCellSize - 1;
        const [ pixelX, pixelY ] = this.renderer.translateMouseCoordinatePixel(ev.x, ev.y);

        this.gridOffsetX -= (pixelX - this.gridOffsetX) * deltaScaleFactor;
        this.gridOffsetY -= (pixelY - this.gridOffsetY) * deltaScaleFactor;

        this.constrainOffsetXY();
        this.draw();
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

        // Mouse drag start
        if (!this.moving && ev.target as unknown === this.renderer.canvas) {
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
        const deltaX = ev.clientX - this.lastMousePosition[0];
        const deltaY = ev.clientY - this.lastMousePosition[1];

        // Offset current grid position by
        this.gridOffsetX += deltaX * this.renderer.pixelScale;
        this.gridOffsetY += deltaY * this.renderer.pixelScale;

        // Record new last mouse position
        this.lastMousePosition = [ ev.clientX, ev.clientY ];

        this.constrainOffsetXY();
        this.draw();
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
            this.renderer.canvas.width - this.gridCellSize);

        this.gridOffsetY = clamp(this.gridOffsetY,
            -this.gridCellSize * (this.board.size[1] - 1),
            this.renderer.canvas.height - this.gridCellSize);
    }

    /**
     * Draws the board to the canvas
     */
    public draw(): void {

        // Clear canvas
        this.renderer.context.clearRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);

        // Determine which tiles are visible on screen
        const startX = Math.max(0, Math.floor(-this.gridOffsetX / this.gridCellSize));
        const startY = Math.max(0, Math.floor(-this.gridOffsetY / this.gridCellSize));
        const endX = Math.min(this.board.size[0], Math.ceil((this.renderer.canvas.width - this.gridOffsetX) / this.gridCellSize));
        const endY = Math.min(this.board.size[1], Math.ceil((this.renderer.canvas.height - this.gridOffsetY) / this.gridCellSize));

        // Draw tiles to screen
        for (let y = startY; y < endY; y++) {
            const row = this.board.tiles[y];
            for (let x = startX; x < endX; x++) {
                const tile = row[x];

                this.renderer.context.fillStyle = tile.tileType.color;
                this.renderer.context.fillRect(
                    this.gridOffsetX + tile.x * this.gridCellSize,
                    this.gridOffsetY + tile.y * this.gridCellSize,
                    this.gridCellSize - 1,
                    this.gridCellSize - 1);
            }
        }
    }
}