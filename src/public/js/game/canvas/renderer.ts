// Renderer base class for rendering objects to the canvas
export class Renderer {
    public readonly canvas: HTMLCanvasElement;
    public readonly context: CanvasRenderingContext2D;

    protected _canvasScaleX: number;
    protected _canvasScaleY: number;

    constructor(canvasID: string) {
        // Fetch canvas
        this.canvas = $(canvasID).get(0) as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        // Calculate canvas scale for the first time
        this._canvasScaleX = this.canvas.width / this.canvas.clientWidth;
        this._canvasScaleY = this.canvas.height / this.canvas.clientHeight;

        // Register event listeners
        $(window).on('resize', () => this.onResize());
    }

    // Recalculate canvas scale when window is resized
    private onResize() {
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

export let baseRenderer: Renderer;

$(() => {
    baseRenderer = new Renderer('#game-canvas');
});
