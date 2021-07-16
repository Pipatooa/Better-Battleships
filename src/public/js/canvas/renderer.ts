let canvasRenderer : CanvasRenderer;
let grid: Grid;

function set(sizeX: number, sizeY: number) {
    grid = new Grid(sizeX, sizeY);
}

class CanvasRenderer {
    public readonly canvas: HTMLCanvasElement;
    public readonly context: CanvasRenderingContext2D;

    constructor() {
        this.canvas = $('#game-canvas').get(0) as HTMLCanvasElement;
        this.context = <CanvasRenderingContext2D> this.canvas.getContext('2d');
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
    }

    private onMouseMove(ev: MouseEvent) {
        if (ev.buttons == 0)
            return;

        this.viewOffsetX += ev.movementX;
        this.viewOffsetY += ev.movementY;
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
