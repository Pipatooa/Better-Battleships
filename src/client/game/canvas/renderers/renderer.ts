import type { ModelProgram }    from '../model-programs/model-program';
import type { ViewportHandler } from '../viewport-handler';

/**
 * Renderer - Client Version
 *
 * Base class for all objects responsible for rendering graphics to canvases
 */
export abstract class Renderer {

    public abstract readonly viewportHandler: ViewportHandler;

    private rendering = false;
    private _renderNext = false;

    protected constructor(protected readonly gl: WebGL2RenderingContext,
                          protected readonly modelPrograms: ModelProgram<string, string>[]) {

    }

    /**
     * Retrieves a WebGL context for a canvas
     *
     * @param    canvas HTML canvas element
     * @returns         Created WebGL context
     */
    protected static getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
        const gl = canvas.getContext('webgl2');
        if (gl === null)
            canvas.innerHTML = 'Sorry, your browser does not support WebGL 2.0. Please use an up-to-date desktop browser supporting WebGL 2.0.';
        return gl!;
    }

    /**
     * Renders a single frame
     */
    private renderFrame(): void {
        if (this.rendering) {
            if (this._renderNext) {
                this.preRender();
                this.executePrograms();
            }
            this.postRender();
        }
        this._renderNext = false;
    }

    /**
     * Executed before attached programs are executed
     */
    protected preRender(): void {
        this.viewportHandler.push();
    }

    /**
     * Executed after attached programs have executed
     */
    private postRender(): void {
        requestAnimationFrame(() => this.renderFrame());
    }

    /**
     * Executes all programs attached to this renderer
     */
    protected executePrograms(): void {
        for (const program of this.modelPrograms) {
            program.executeProgram();
        }
    }

    /**
     * Flags that the next frame should be rendered
     */
    public renderNext(): void {
        this._renderNext = true;
        this.doRender = true;
    }

    /**
     * Getters and setters
     */

    public get doRender(): boolean {
        return this.rendering;
    }

    public set doRender(doRender: boolean) {
        if (doRender && !this.rendering) {
            this.rendering = true;
            this._renderNext = true;
            this.renderFrame();
        }
        this.rendering = doRender;
    }
}
