import { clamp } from '../../../shared/utility';
import { game } from '../game';
import type { Board } from '../scenario/board';
import type { GameRenderer } from './game-renderer';

/**
 * BoardRenderer - Client Version
 *
 * Responsible for rendering the board to game canvases
 */
export class BoardRenderer {

    protected _gridCellSize: number;
    protected gridOffsetX: number;
    protected gridOffsetY: number;
    public readonly gridBorderRatio = 0.05;

    protected gridSizePixelsX: number;
    protected gridSizePixelsY: number;

    protected readonly gridCellSizeLowerBound: number;
    protected readonly gridCellSizeUpperBound: number;

    private _highlightedRegion: string | undefined = game.startRegionID;
    
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
            this.renderer.mainCanvas.width / this.board.size[0] / zoomBoundMultiplier,
            this.renderer.mainCanvas.height / this.board.size[1] / zoomBoundMultiplier
        );
        this.gridCellSizeUpperBound = Math.min(this.renderer.mainCanvas.width, this.renderer.mainCanvas.height) / zoomBoundMinTiles;

        // Calculate center of spawn region to center camera upon
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (let y = 0; y < this.board.size[1]; y++) {
            const row = this.board.tiles[y];
            for (let x = 0; x < this.board.size[0]; x++) {
                const regions = row[x][1];
                if (regions.map(r => r.id).includes(this._highlightedRegion!)) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        this._gridCellSize = 0.75 * Math.min(
            this.renderer.mainCanvas.width / (maxX - minX + 1),
            this.renderer.mainCanvas.height / (maxY - minY + 1));
        this.constrainZoom();
        this.gridOffsetX = 0.5 * (this.renderer.mainCanvas.width - (minX + maxX + 1) * this._gridCellSize);
        this.gridOffsetY = 0.5 * (this.renderer.mainCanvas.height - (minY + maxY + 1) * this._gridCellSize);
        this.gridSizePixelsX = this._gridCellSize * this.board.size[0];
        this.gridSizePixelsY = this._gridCellSize * this.board.size[1];
        this.constrainOffsetXY();
        this.redrawAll();

        // Draw grid for first time
        this.redrawAll();

        // Register event listeners
        this.renderer.mainCanvas.wrapperHTMLElement.addEventListener('wheel', (ev: WheelEvent) => this.onScroll(ev));
    }

    /**
     * Activated when the scroll wheel is used over the canvas
     *
     * @param  ev Mouse wheel event
     */
    private onScroll(ev: WheelEvent): void {

        // Prevent scrolling of page
        ev.preventDefault();

        const oldGridCellSize = this._gridCellSize;
        this._gridCellSize *= 1 - ev.deltaY * 0.001;
        this.constrainZoom();
        this.gridSizePixelsX = this._gridCellSize * this.board.size[0];
        this.gridSizePixelsY = this._gridCellSize * this.board.size[1];

        const deltaScaleFactor = this._gridCellSize / oldGridCellSize - 1;
        const [ pixelX, pixelY ] = this.renderer.mainCanvas.translateMouseCoordinatePixel(ev.x, ev.y);

        this.gridOffsetX -= (pixelX - this.gridOffsetX) * deltaScaleFactor;
        this.gridOffsetY -= (pixelY - this.gridOffsetY) * deltaScaleFactor;

        this.constrainOffsetXY();

        // Call redraw functions
        this.renderer.redrawAll();
    }

    /**
     * Applies a movement delta dx and dy to the board from a pointer drag
     *
     * Does not affect the rendered version of the board. Only internal representation
     *
     * @param    dx Horizontal pointer delta
     * @param    dy Vertical pointer delta
     * @returns     [dx, dy] Pointer delta after constraints have been applied
     */
    public applyMovementDelta(dx: number, dy: number): [number, number] {

        // Offset current grid position by delta, recording old offsets
        const oldGridOffsetX = this.gridOffsetX;
        const oldGridOffsetY = this.gridOffsetY;
        this.gridOffsetX += dx;
        this.gridOffsetY += dy;

        // Make sure new board position is valid
        this.constrainOffsetXY();

        // Calculate delta after xy has been constrained
        dx = this.gridOffsetX - oldGridOffsetX;
        dy = this.gridOffsetY - oldGridOffsetY;

        return [dx, dy];
    }

    /**
     * Constrain zoom to lower and upper bound
     */
    private constrainZoom(): void {
        this._gridCellSize = clamp(this._gridCellSize, this.gridCellSizeLowerBound, this.gridCellSizeUpperBound);
    }

    /**
     * Constrain panning so that at least one cell of the grid is showing
     */
    private constrainOffsetXY(): void {
        this.gridOffsetX = clamp(this.gridOffsetX,
            -this._gridCellSize * (this.board.size[0] - 1),
            this.renderer.mainCanvas.width - this._gridCellSize);

        this.gridOffsetY = clamp(this.gridOffsetY,
            -this._gridCellSize * (this.board.size[1] - 1),
            this.renderer.mainCanvas.height - this._gridCellSize);
    }

    /**
     * Converts coordinates on the board to pixel coordinates on the canvas
     *
     * @param    x X coordinate of board position
     * @param    y Y coordinate of board position
     * @returns    Corresponding pixel coordinates on the canvas
     */
    public translateBoardCoordinatePixel(x: number, y: number): [number, number] {
        const transX = x * this._gridCellSize + this.gridOffsetX;
        const transY = y * this._gridCellSize + this.gridOffsetY;
        return [ transX, transY ];
    }

    /**
     * Converts pixel coordinates on the canvas to coordinates on the board
     *
     * @param    x                X coordinate on the canvas
     * @param    y                Y coordinate on the canvas
     * @param    roundingFunction Rounding function to apply to grid sub-coordinate
     * @returns                   Corresponding coordinates on the board
     */
    public translatePixelCoordinateBoard(x: number, y: number, roundingFunction: (x: number) => number = Math.floor): [number, number] {
        const transX = roundingFunction((x - this.gridOffsetX) / this._gridCellSize);
        const transY = roundingFunction((y - this.gridOffsetY) / this._gridCellSize);
        return [ transX, transY ];
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
        this.renderer.mainCanvas.contexts.board.clearRect(x, y, w, h);

        if (this._highlightedRegion !== undefined)
            this.renderer.mainCanvas.contexts.highlight.fillRect(x, y, w, h);

        // Determine which tiles are within redraw bounds
        const gridXStart = clamp(Math.floor((x - this.gridOffsetX) / this._gridCellSize), 0, this.board.size[0] - 1);
        const gridYStart = clamp(Math.floor((y - this.gridOffsetY) / this._gridCellSize), 0, this.board.size[1] - 1);
        const gridXEnd = clamp(Math.floor((x + w - this.gridOffsetX) / this._gridCellSize), 0, this.board.size[0] - 1);
        const gridYEnd = clamp(Math.floor((y + h - this.gridOffsetY) / this._gridCellSize), 0, this.board.size[1] - 1);

        // Debug - Shows only redrawn regions
        // this.renderer.mainCanvas.contexts.board.clearRect(0, 0, this.renderer.mainCanvas.width, this.renderer.mainCanvas.height);
        // this.renderer.mainCanvas.contexts.board.fillStyle = '#ff0000';
        // this.renderer.mainCanvas.contexts.board.fillRect(x, y, w, h);

        const gridSep = this._gridCellSize * this.gridBorderRatio;

        // Redraw border for tiles
        let borderX = this.gridOffsetX + gridXStart * this._gridCellSize - gridSep;
        let borderY = this.gridOffsetY + gridYStart * this._gridCellSize - gridSep;
        let borderW = (gridXEnd - gridXStart + 1) * this._gridCellSize + gridSep;
        let borderH = (gridYEnd - gridYStart + 1) * this._gridCellSize + gridSep;
        this.renderer.mainCanvas.contexts.board.fillStyle = '#16246b';
        this.renderer.mainCanvas.contexts.board.fillRect(borderX, borderY, borderW, borderH);

        // Draw tiles to screen
        for (let y = gridYStart; y <= gridYEnd; y++) {
            const row = this.board.tiles[y];
            for (let x = gridXStart; x <= gridXEnd; x++) {
                const tile = row[x];

                this.renderer.mainCanvas.contexts.board.fillStyle = tile[0].color;

                // Draw cell to tile canvas
                this.renderer.mainCanvas.contexts.board.fillRect(
                    this.gridOffsetX + x * this._gridCellSize,
                    this.gridOffsetY + y * this._gridCellSize,
                    this._gridCellSize - gridSep,
                    this._gridCellSize - gridSep
                );

                // Clear view in highlighted region
                if (this._highlightedRegion !== undefined && tile[1].map(r => r.id).includes(this._highlightedRegion)) {
                    this.renderer.mainCanvas.contexts.highlight.clearRect(
                        this.gridOffsetX + x * this._gridCellSize,
                        this.gridOffsetY + y * this._gridCellSize,
                        this._gridCellSize - gridSep,
                        this._gridCellSize - gridSep
                    );
                }
            }
        }
    }

    /**
     * Redraws the entire board
     */
    public redrawAll(): void {
        this.redrawRegion(0, 0, this.renderer.mainCanvas.width, this.renderer.mainCanvas.height);
    }

    /**
     * Getters and setters
     */

    public get gridCellSize(): number {
        return this._gridCellSize;
    }

    public set highlightedRegion(region: string | undefined) {
        this._highlightedRegion = region;
        this.redrawAll();

        if (this._highlightedRegion === undefined)
            this.renderer.mainCanvas.contexts.highlight.clearRect(0, 0, this.renderer.mainCanvas.width, this.renderer.mainCanvas.height);
    }
}
