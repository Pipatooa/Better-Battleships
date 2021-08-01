/*
import {Renderer} from "./renderer";
import {Grid} from "../../shared/grid";
import {clamp} from "../../shared/utility";

export class GridRenderer {
    protected gridCellSize: number = 0;
    protected gridOffsetX: number = 0;
    protected gridOffsetY: number = 0;

    private readonly wheelListener: (ev: WheelEvent) => any;
    private readonly mouseMoveListener: (ev: MouseEvent) => any;

    private readonly gridCellSizeLowerBound: number;
    private readonly gridCellSizeUpperBound: number;

    constructor(protected readonly renderer: Renderer,
                protected readonly grid: Grid) {

        // Calculate limits for grid cell rendering
        this.gridCellSizeLowerBound = Math.min(this.renderer.canvas.width / this.grid.sizeX, this.renderer.canvas.height / this.grid.sizeY);
        this.gridCellSizeUpperBound = Math.min(this.renderer.canvas.width, this.renderer.canvas.height) / 5;

        // Register event listeners
        this.wheelListener = (ev: WheelEvent) => this.onScroll(ev);
        this.mouseMoveListener = (ev: MouseEvent) => this.onMouseMove(ev);

        this.renderer.canvas.addEventListener('wheel', this.wheelListener);
        this.renderer.canvas.addEventListener('mousemove', this.mouseMoveListener);

        // Draw grid for first time
        this.constrainZoom();
        this.draw();
    }

    // Control zoom on grid when user scrolls
    private onScroll(ev: WheelEvent) {
        let oldGridCellSize = this.gridCellSize;
        this.gridCellSize *= 1 -ev.deltaY * 0.001;
        this.constrainZoom();

        // Compare new size of grid cells to old size of grid cells
        let deltaScaleFactor = this.gridCellSize / oldGridCellSize - 1;

        // Get the mouse position in pixel coordinates
        let [pixelX, pixelY] = this.renderer.translateMouseCoordinatePixel(ev.x, ev.y);

        this.gridOffsetX -= (pixelX - this.gridOffsetX) * deltaScaleFactor;
        this.gridOffsetY -= (pixelY - this.gridOffsetY) * deltaScaleFactor;

        this.constrainOffsetXY();
        this.draw();
    }

    // Control movement of grid when user moves their mouse
    private onMouseMove(ev: MouseEvent) {
        if (ev.buttons == 0)
            return;

        this.gridOffsetX += ev.movementX * this.renderer.canvasScaleX;
        this.gridOffsetY += ev.movementY * this.renderer.canvasScaleY;

        this.constrainOffsetXY();
        this.draw();
    }

    // Constrain zoom to lower and upper bound
    private constrainZoom() {
        this.gridCellSize = clamp(this.gridCellSize, this.gridCellSizeLowerBound, this.gridCellSizeUpperBound);
    }

    // Constrain panning to edges of grid
    private constrainOffsetXY() {
        this.gridOffsetX = clamp(this.gridOffsetX, this.renderer.canvas.width - this.gridCellSize * this.grid.sizeX, 0);
        this.gridOffsetY = clamp(this.gridOffsetY, this.renderer.canvas.height - this.gridCellSize * this.grid.sizeY, 0);
    }

    // Draw the grid to the canvas
    public draw() {
        this.renderer.context.clearRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);

        this.grid.tiles.forEach(tiles => tiles.forEach(tile => {
            this.renderer.context.fillStyle = "#" + tile.tileType.hexColor;
            this.renderer.context.fillRect(
                this.gridOffsetX + tile.x * this.gridCellSize,
                this.gridOffsetY + tile.y * this.gridCellSize,
                this.gridCellSize - 1,
                this.gridCellSize - 1);
        }));
    }

    // Removes all event listeners
    public deactivate() {
        this.renderer.canvas.removeEventListener('wheel', this.wheelListener);
        this.renderer.canvas.removeEventListener('mousemove', this.mouseMoveListener);
    }
}*/
