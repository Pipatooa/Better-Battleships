import {Renderer} from "./renderer.js";
import {Grid} from "../grid.js";

export class GridRenderer {
    protected gridCellSize: number = 10;
    protected gridOffsetX: number = 0;
    protected gridOffsetY: number = 0;

    constructor(protected readonly renderer: Renderer,
                protected readonly grid: Grid) {

        // Register event listeners
        this.renderer.canvas.addEventListener('wheel', (ev: WheelEvent) => this.onScroll(ev));
        this.renderer.canvas.addEventListener('mousemove', (ev: MouseEvent) => this.onMouseMove(ev));

        // Draw grid for first time
        this.draw()
    }

    private onScroll(ev: WheelEvent) {
        this.gridCellSize *= 1 + -ev.deltaY * 0.001;
        this.draw();

        let [uvX, uvY] = this.renderer.translateMouseCoordinateUV(ev.x, ev.y);
        let [pixelX, pixelY] = this.renderer.translateMouseCoordinatePixel(ev.x, ev.y);
        console.log(uvX, uvY, pixelX, pixelY);
    }

    private onMouseMove(ev: MouseEvent) {
        if (ev.buttons == 0)
            return;

        this.gridOffsetX += ev.movementX * this.renderer.canvasScaleX;
        this.gridOffsetY += ev.movementY * this.renderer.canvasScaleY;
        this.draw();
    }

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

    public deactivate() {
        $(this.renderer.canvas).off('')
    }
}