import { clamp }             from 'shared/utility';
import type { Board }        from '../../scenario/board';
import type { ModelProgram } from './model-programs/model-program';

export class ViewportHandler {

    private readonly canvasOffsetParent: HTMLDivElement;
    private readonly canvasScale = 1.0;
    private _canvasAspectRatio = 1;

    private readonly offsetUniform: Float32Array;
    private readonly scaleUniform: Float32Array;

    private readonly scaleLowerBound: number;
    private readonly scaleUpperBound: number;

    private dragging = false;
    private lastPointerPosition: [number, number] = [0, 0];

    private readonly scrollRatio = 0.85;
    private readonly scrollSensitivity = 0.01;
    
    private _updateCallback: (() => void) | undefined;

    public constructor(public readonly canvas: HTMLCanvasElement,
                       private readonly gl: WebGL2RenderingContext,
                       private readonly modelProgram: ModelProgram<never, 'offset' | 'scale'>,
                       private readonly allowPanning: boolean,
                       public relativeSubjectDimensions: [number, number],
                       scaleLowerBound?: number,
                       scaleUpperBound?: number,
                       private forcedAspect?: number,
                       initialOffset?: [number, number],
                       initialScale?: [number, number]) {

        this.scaleLowerBound = scaleLowerBound ?? 0.25;
        this.scaleUpperBound = scaleUpperBound ?? 3.0;

        this.offsetUniform = new Float32Array(initialOffset ?? [-0.5, -0.5]);
        this.scaleUniform = new Float32Array(initialScale ?? [1, 1]);

        this.canvasOffsetParent = this.canvas.offsetParent as HTMLDivElement;
        this.updateViewport(false);

        window.addEventListener('resize', () => this.updateViewport(true));

        if (this.allowPanning) {
            document.addEventListener('pointermove', (ev) => this.onPointerMove(ev));
            this.canvas.addEventListener('wheel', (ev) => this.onWheel(ev));
        }
    }

    /**
     * Resizes canvas to match screen size and updates GL viewport accordingly
     *
     * @param  callUpdateCallback Whether to call the update callback
     */
    public updateViewport(callUpdateCallback: boolean): void {

        // Update canvas dimensions
        const wrapperElement = this.canvas.parentElement!;
        this.canvas.width = 0;
        this.canvas.height = 0;

        const w = wrapperElement.clientWidth * this.canvasScale;
        const h = this.forcedAspect !== undefined
            ? w * this.forcedAspect
            : wrapperElement.clientHeight * this.canvasScale;

        this.canvas.width = w;
        this.canvas.height = h;

        // Update viewport and scale information
        this._canvasAspectRatio = w / h;
        this.scaleUniform[1] = this.scaleUniform[0] * this._canvasAspectRatio;
        this.gl.viewport(0, 0, w, h);
        if (callUpdateCallback)
            this._updateCallback?.();
    }

    /**
     * Pushes offset and scale information to GPU
     */
    public push(): void {
        this.gl.useProgram(this.modelProgram.program);
        this.gl.uniform2fv(this.modelProgram.uniformLocations.offset, this.offsetUniform);
        this.gl.uniform2fv(this.modelProgram.uniformLocations.scale, this.scaleUniform);
    }

    /**
     * Converts screen space coordinates to UV canvas coordinates
     *
     * @param    x X coordinate of screen
     * @param    y Y coordinate of screen
     * @returns    Mapped UV coordinates
     */
    public screenToCanvasCoordinates(x: number, y: number): [number, number] {
        const canvasBoundingRect = this.canvas.getBoundingClientRect();
        let newX = (x - canvasBoundingRect.left) / this.canvas.clientWidth * 2 - 1;
        let newY = -(y - canvasBoundingRect.top) / this.canvas.clientHeight * 2 + 1;
        return [newX, newY];
    }

    /**
     * Converts screen space coordinate to board coordinates
     *
     * @param    x     X coordinate of screen
     * @param    y     Y coordinate of screen
     * @param    board Board to map coordinates on to
     * @returns        Non-rounded mapped board coordinates
     */
    public canvasToBoardCoordinates(x: number, y: number, board: Board): [number, number] {
        let newX = (x / this.scaleUniform[0] - this.offsetUniform[0]) * board.size[0] / this.relativeSubjectDimensions[0];
        let newY = (1 - y / this.scaleUniform[1] + this.offsetUniform[1]) * board.size[1] / this.relativeSubjectDimensions[1];
        return [newX, newY];
    }

    /**
     * Manually sets the scale for the viewport
     *
     * @param  x Horizontal scale amount
     * @param  y Vertical scale amount
     */
    public setScale(x: number, y: number): void {
        this.offsetUniform[0] = x;
        this.offsetUniform[1] = y;
        this._updateCallback?.();
    }

    /**
     * Updates board position when pointer is dragged across board
     *
     * @param  ev Pointer movement event
     */
    private onPointerMove(ev: PointerEvent): void {

        // Pointer drag start
        if (!this.dragging && ev.buttons === 1 && ev.target as unknown === this.canvas) {
            this.dragging = true;
            this.lastPointerPosition = [ev.clientX, ev.clientY];
            ev.preventDefault();
            return;
        }

        // Pointer drag stop
        if (this.dragging && ev.buttons === 0) {
            this.dragging = false;
            return;
        }

        if (!this.dragging)
            return;

        ev.preventDefault();
        this.offsetUniform[0] += (ev.clientX - this.lastPointerPosition[0]) / this.canvas.clientWidth / this.scaleUniform[0] * 2;
        this.offsetUniform[1] -= (ev.clientY - this.lastPointerPosition[1]) / this.canvas.clientHeight / this.scaleUniform[1] * 2;
        this.constrainCanvasOffset();
        this.lastPointerPosition = [ev.clientX, ev.clientY];
        this._updateCallback?.();
    }

    /**
     * Updates board scale when po
     *
     * @param  ev Wheel event
     */
    private onWheel(ev: WheelEvent): void {
        ev.preventDefault();
        const scaleFactor = Math.pow(this.scrollRatio, ev.deltaY * this.scrollSensitivity);
        const oldScaleX = this.scaleUniform[0];
        this.scaleUniform[0] = clamp(oldScaleX * scaleFactor, this.scaleLowerBound, this.scaleUpperBound);
        this.scaleUniform[1] = this.scaleUniform[0] * this._canvasAspectRatio;
        const deltaScaleFactor = oldScaleX / this.scaleUniform[0] - 1;

        const [x, y] = this.screenToCanvasCoordinates(ev.clientX, ev.clientY);
        this.offsetUniform[0] += x / oldScaleX * deltaScaleFactor;
        this.offsetUniform[1] += y / oldScaleX / this._canvasAspectRatio * deltaScaleFactor;
        this.constrainCanvasOffset();
        this._updateCallback?.();
    }

    /**
     * Constrains panning so that viewport stays in sensible location to frame subject
     */
    private constrainCanvasOffset(): void {
        const xMin = -1 / this.scaleUniform[0] - 1;
        const xMax = 1 / this.scaleUniform[0] - 1 + this.relativeSubjectDimensions[0];
        this.offsetUniform[0] = clamp(this.offsetUniform[0], xMin, xMax);
        const yMin = -1 / this.scaleUniform[1] - 1;
        const yMax = 1 / this.scaleUniform[1] - 1 + this.relativeSubjectDimensions[1];
        this.offsetUniform[1] = clamp(this.offsetUniform[1], yMin, yMax);
    }

    /**
     * Getters and setters
     */

    public get canvasAspectRatio(): number {
        return this._canvasAspectRatio;
    }

    public set _forcedAspect(ratio: number) {
        this.forcedAspect = ratio;
        this._canvasAspectRatio = ratio;
        this.scaleUniform[1] = this.scaleUniform[0] * ratio;
    }

    public set updateCallback(updateCallback: () => void) {
        this._updateCallback = updateCallback;
    }
}
