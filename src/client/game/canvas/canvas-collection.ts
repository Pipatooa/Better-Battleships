/**
 * CanvasCollection - Client Version
 *
 * A collection of layered canvases under one canvas wrapper
 */
export class CanvasCollection<K extends string> {
    
    public readonly wrapperHTMLElement: HTMLDivElement;
    public readonly topElement: HTMLElement;

    public readonly canvases: Record<K, HTMLCanvasElement>;
    public readonly contexts: Record<K, CanvasRenderingContext2D>;
    private readonly canvasList: [HTMLCanvasElement, CanvasRenderingContext2D][];
    
    private _width = 0;
    private _height = 0;
    
    private onMoveListeners: [number, (dx: number, dy: number) => void][] = [];
    private onMoveListenerNextID = 0;
    
    /**
     * CanvasCollection constructor
     *
     * @param  wrapperElement Canvas wrapper element containing canvas elements
     * @param  canvasNames    Names to assign to each child canvas element for easy indexing
     * @param  pixelScale     Number of pixels to draw compared to number of actual pixels composing canvas
     */
    public constructor(public readonly wrapperElement: JQuery,
                       canvasNames: K[],
                       public readonly pixelScale: number) {
        
        this.wrapperHTMLElement = this.wrapperElement.get(0) as HTMLDivElement;
        
        this.canvases = {} as Record<K, HTMLCanvasElement>;
        this.contexts = {} as Record<K, CanvasRenderingContext2D>;
        this.canvasList = [];

        const canvasElements = this.wrapperElement.children();
        for (let i = 0; i < canvasNames.length; i++) {
            const canvasName = canvasNames[i];
            const canvasElement = canvasElements.get(i) as HTMLCanvasElement;
            const canvasContext = canvasElement.getContext('2d')!;
            this.canvases[canvasName] = canvasElement;
            this.contexts[canvasName] = canvasContext;
            this.canvasList.push([canvasElement, canvasContext]);
        }

        this.topElement = this.canvasList[this.canvasList.length - 1][0];
        this.onResize();
    }

    /**
     * Resizes all canvases under this canvas wrapper to match size specified
     *
     * @param  w New width for canvases
     * @param  h New height for canvases
     */
    private setCanvasSize(w: number, h: number): void {
        this._width = w;
        this._height = h;
        
        for (const canvasInfo of this.canvasList) {
            canvasInfo[0].width = w;
            canvasInfo[0].height = h;
        }
    }
    
    /**
     * Resizes canvas when window is resized
     */
    public onResize(): void {
        const newWidth: number = this.wrapperHTMLElement.clientWidth * this.pixelScale;
        const newHeight: number = this.wrapperHTMLElement.clientHeight * this.pixelScale;
        this.setCanvasSize(newWidth, newHeight);
    }

    /**
     * Translates mouse coordinates to UV coordinates
     *
     * @param    x X coordinate of mouse
     * @param    y Y coordinate of mouse
     * @returns    UV coordinates between 0 and 1 corresponding to mouse coordinates
     */
    public translateMouseCoordinateUV(x: number, y: number): [number, number] {
        const transX = (x - this.wrapperHTMLElement.offsetLeft) / this.width * this.pixelScale;
        const transY = (y - this.wrapperHTMLElement.offsetTop) / this.height * this.pixelScale;
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
        const transX = (x - this.wrapperHTMLElement.offsetLeft) * this.pixelScale;
        const transY = (y - this.wrapperHTMLElement.offsetTop) * this.pixelScale;
        return [ transX, transY ];
    }

    /**
     * Moves all pixel data on canvases by specified delta
     *
     * @param  dx Horizontal distance to move pixel data
     * @param  dy Vertical distance to move pixel data
     */
    public movePixelData(dx: number, dy: number): void {
        for (const canvasInfo of this.canvasList) {
            const pixelData = canvasInfo[1].getImageData(0, 0, canvasInfo[0].width, canvasInfo[0].height);
            canvasInfo[1].putImageData(pixelData, dx, dy);
        }

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
    
    public get width(): number {
        return this._width;
    }
    
    public get height(): number {
        return this._height;
    }
}
