/**
 * CanvasInfo - Client Version
 *
 * Class containing all information about a canvas element
 */
export class CanvasInfo {
    public readonly context: CanvasRenderingContext2D;

    protected canvasParent: HTMLDivElement;
    protected _canvasScale: number;

    /**
     * CanvasInfo constructor
     *
     * @param  canvas      HTML canvas element
     * @param  _pixelScale Number of pixels to draw compared to number of actual pixels composing canvas 
     */
    public constructor(public readonly canvas: HTMLCanvasElement,
                       protected _pixelScale: number) {

        // Get 2D rendering context for this canvas
        this.context = canvas.getContext('2d')!;

        // Set height and width of canvas for the first time
        this.canvas.width = this.canvas.clientWidth * this._pixelScale;
        this.canvas.height = this.canvas.clientHeight * this._pixelScale;
        this._canvasScale = 1000 / Math.min(this.canvas.width, this.canvas.height);

        // Cache container for this canvas
        this.canvasParent = this.canvas.offsetParent as HTMLDivElement;
    }

    /**
     * Resizes canvas when window is resized
     */
    public onResize(): void {
        this.canvas.width = this.canvas.clientWidth * this._pixelScale;
        this.canvas.height = this.canvas.clientHeight * this._pixelScale;
        this._canvasScale = 1000 / Math.min(this.canvas.width, this.canvas.height);
    }

    /**
     * Translates mouse coordinates to UV coordinates
     *
     * @param    x X coordinate of mouse
     * @param    y Y coordinate of mouse
     * @returns    UV coordinates between 0 and 1 corresponding to mouse coordinates
     */
    public translateMouseCoordinateUV(x: number, y: number): [number, number] {
        const transX = (x - this.canvasParent.offsetLeft) / this.canvas.clientWidth;
        const transY = (y - this.canvasParent.offsetTop) / this.canvas.clientHeight;
        return [ transX, transY ];
    }

    /**
     * Translates mouse coordinates to pixel coordinates
     *
     * @param    x X coordinate of mouse
     * @param    y Y coordinate of mouse
     * @returns    Canvas pixel coordinates corresponding to mouse coordinates
     */
    public translateMouseCoordinatePixel(x: number, y: number): [number, number] {

        const transX = (x - this.canvasParent.offsetLeft) * this._pixelScale;
        const transY = (y - this.canvasParent.offsetTop) * this._pixelScale;
        return [ transX, transY ];
    }

    /**
     * Getters and setters
     */

    public get pixelScale(): number {
        return this._pixelScale;
    }

    public get canvasScale(): number {
        return this._pixelScale;
    }
}