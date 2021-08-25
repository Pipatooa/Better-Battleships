/**
 * BaseRenderer - Client Version
 *
 * Base class for rendering objects to the canvas
 */
export class BaseRenderer {
    public readonly canvas: HTMLCanvasElement;
    public readonly context: CanvasRenderingContext2D;

    protected _pixelScale: number = 1;
    protected _canvasScale: number;

    /**
     * BaseRenderer constructor
     * @param canvas JQuery element for canvas
     */
    constructor(canvas: JQuery) {

        // Fetch canvas
        this.canvas = canvas.get(0) as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        // Set height and width of canvas for the first time
        this.canvas.width = this.canvas.clientWidth * this._pixelScale;
        this.canvas.height = this.canvas.clientHeight * this._pixelScale;
        this._canvasScale = 1000 / Math.min(this.canvas.width, this.canvas.height);

        // Register event listeners
        $(window).on('resize', () => this.onResize());
    }

    /**
     * Resizes canvas when window is resized
     * @private
     */
    private onResize() {
        this.canvas.width = this.canvas.clientWidth * this._pixelScale;
        this.canvas.height = this.canvas.clientHeight * this._pixelScale;
        this._canvasScale = 1000 / Math.min(this.canvas.width, this.canvas.height);
    }

    /**
     * Translates mouse coordinates to UV coordinates
     * @param x X coordinate of mouse
     * @param y Y coordinate of mouse
     * @returns [x, y] -- UV coordinates between 0 and 1 corresponding to mouse coordinates
     */
    public translateMouseCoordinateUV(x: number, y: number): [number, number] {
        let transX = (x - this.canvas.offsetLeft) / this.canvas.clientWidth;
        let transY = (y - this.canvas.offsetTop) / this.canvas.clientHeight;
        return [transX, transY];
    }

    /**
     * Translates mouse coordinates to pixel coordinates
     * @param x X coordinate of mouse
     * @param y Y coordinate of mouse
     * @returns [x, y] -- Canvas pixel coordinates corresponding to mouse coordinates
     */
    public translateMouseCoordinatePixel(x: number, y: number): [number, number] {
        let transX = (x - this.canvas.offsetLeft) * this._pixelScale;
        let transY = (y - this.canvas.offsetTop) * this._pixelScale;

        return [transX, transY];
    }

    /**
     * Getters and setters
     */

    public get canvasScale(): number {
        return this._canvasScale;
    }

    public get pixelScale(): number {
        return this._pixelScale;
    }
}
