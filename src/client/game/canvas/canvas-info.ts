/**
 * CanvasInfo - Client Version
 *
 * Class containing all information about a canvas element
 */
export class CanvasInfo {
    public readonly context: CanvasRenderingContext2D;

    protected canvasParent: HTMLDivElement;
    protected _canvasScale: number;

    private onMoveListeners: [number, (dx: number, dy: number) => void][] = [];
    private onMoveListenerNextID = 0;

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

        // Set canvas size for the first time
        this._canvasScale = 0;
        this.onResize();

        // Cache container for this canvas
        this.canvasParent = this.canvas.offsetParent as HTMLDivElement;
    }

    /**
     * Resizes canvas when window is resized
     */
    public onResize(): void {

        // Split declaration to ensure that canvas height does not change between assignments
        const newWidth: number = this.canvas.clientWidth * this._pixelScale;
        const newHeight: number = this.canvas.clientHeight * this._pixelScale;
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;

        // Relative canvas size compared to a 1000x1000 canvas
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
     * Moves all pixel data on this canvas by specified delta
     *
     * @param  dx Horizontal distance to move pixel data
     * @param  dy Vertical distance to move pixel data
     */
    public movePixelData(dx: number, dy: number): void {
        const pixelData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.context.putImageData(pixelData, dx, dy);

        // Call movement listeners
        for (const listenerInfo of this.onMoveListeners) {
            listenerInfo[1](dx, dy);
        }
    }

    /**
     * Registers a new listener that will be called when the canvas is moved
     *
     * @param    listener Listener to call
     * @returns           ID that was assigned to the listener
     */
    public registerOnMoveListener(listener: (dx: number, dy: number) => void): number {
        this.onMoveListeners.push([this.onMoveListenerNextID, listener]);
        return this.onMoveListenerNextID++;
    }

    /**
     * Removes a canvas movement listener with a given ID
     *
     * @param  listenerID ID of the listener to remove
     */
    public removeOnMoveListener(listenerID: number): void {
        this.onMoveListeners = this.onMoveListeners.filter(l => l[0] !== listenerID);
    }

    /**
     * Getters and setters
     */

    public get pixelScale(): number {
        return this._pixelScale;
    }

    public get canvasScale(): number {
        return this._canvasScale;
    }
}
