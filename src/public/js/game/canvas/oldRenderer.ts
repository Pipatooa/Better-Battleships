let canvasRenderer : CanvasRenderer;
let grid: Grid;

function set(sizeX: number, sizeY: number) {
    grid = new Grid(sizeX, sizeY);
}

class CanvasRenderer {
    public readonly canvas: HTMLCanvasElement;
    public readonly context: CanvasRenderingContext2D;

    private _canvasScaleX: number;
    private _canvasScaleY: number;

    constructor() {
        // Fetch canvas
        this.canvas = $('#game-canvas').get(0) as HTMLCanvasElement;
        this.context = <CanvasRenderingContext2D> this.canvas.getContext('2d');

        // Calculate canvas scale for the first time
        this._canvasScaleX = this.canvas.width / this.canvas.clientWidth;
        this._canvasScaleY = this.canvas.height / this.canvas.clientHeight;

        // Register event listeners
        $(window).on('resize', () => this.onResize());
    }

    // When the canvas is resized, recalculate canvas scale
    private onResize() {
        console.log(0);
        this._canvasScaleX = this.canvas.width / this.canvas.clientWidth;
        this._canvasScaleY = this.canvas.height / this.canvas.clientHeight;
    }

    // Translates mouse coordinates to UV coordinates
    public translateMouseCoordinateUV(x: number, y: number): [number, number] {
        let transX = (x - this.canvas.offsetLeft) / this.canvas.clientWidth;
        let transY = (y - this.canvas.offsetTop) / this.canvas.clientHeight;
        return [transX, transY];
    }

    // Translates mouse coordinates to pixel coordinates
    public translateMouseCoordinatePixel(x: number, y: number): [number, number] {
        let transX = (x - this.canvas.offsetLeft) * this._canvasScaleX;
        let transY = (y - this.canvas.offsetTop) * this._canvasScaleY;
        return [transX, transY];
    }

    // Getters and setters
    public get canvasScaleX(): number {
        return this._canvasScaleX;
    }

    public get canvasScaleY(): number {
        return this._canvasScaleY;
    }
}

class Grid {
    private readonly sizeX: number;
    private readonly sizeY: number;

    private cellSize: number = 10;
    private cells: GridCell[][] = [];

    private viewOffsetX: number = 0;
    private viewOffsetY: number = 0;
    private mouseLastX: number = 0;
    private mouseLastY: number = 0;

    constructor(sizeX: number, sizeY: number) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;

        // Populate the grid with a set of cells
        for (let x = 0; x < sizeX; x++) {
            this.cells[x] = [];
            for (let y = 0; y < sizeY; y++) {
                this.cells[x][y] = new GridCell(x, y);
            }
        }

        // Register event listeners
        canvasRenderer.canvas.addEventListener('wheel', (ev: WheelEvent) => this.onScroll(ev));
        canvasRenderer.canvas.addEventListener('mousemove', (ev: MouseEvent) => this.onMouseMove(ev));
    }

    private onScroll(ev: WheelEvent) {
        this.cellSize *= 1 + -ev.deltaY * 0.001;
        this.draw();

        let [uvX, uvY] = canvasRenderer.translateMouseCoordinateUV(ev.x, ev.y);
        let [pixelX, pixelY] = canvasRenderer.translateMouseCoordinatePixel(ev.x, ev.y);
        console.log(uvX, uvY, pixelX, pixelY);
    }

    private onMouseMove(ev: MouseEvent) {
        if (ev.buttons == 0)
            return;

        this.mouseLastX = ev.x;
        this.mouseLastY = ev.y;

        this.viewOffsetX += ev.movementX * canvasRenderer.canvasScaleX;
        this.viewOffsetY += ev.movementY * canvasRenderer.canvasScaleY;
        this.draw();
    }

    // Draw all cells on the grid to the screen
    public draw() {

        canvasRenderer.context.clearRect(0, 0, canvasRenderer.canvas.width, canvasRenderer.canvas.height);

        this.cells.forEach(cells => cells.forEach(cell => {
            canvasRenderer.context.fillRect(
                this.viewOffsetX + cell.x * this.cellSize,
                this.viewOffsetY + cell.y * this.cellSize,
                this.cellSize - 1,
                this.cellSize - 1);
        }));
    }
}

class GridCell {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

$(() => {
    canvasRenderer = new CanvasRenderer();
    set(10, 10);
    grid.draw();
})
