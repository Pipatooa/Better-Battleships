import type { ModelProgram }    from './model-programs/model-program';
import type { ViewportHandler } from './viewport-handler';

export abstract class Renderer {

    public abstract viewportHandler: ViewportHandler;

    protected constructor(protected readonly gl: WebGL2RenderingContext,
                          protected readonly modelPrograms: ModelProgram<string, string>[]) {

    }

    protected static getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
        const gl = canvas.getContext('webgl2');
        if (gl === null)
            canvas.innerHTML = 'Sorry, your browser does not support WebGL 2.0. Please use an up-to-date desktop browser supporting WebGL 2.0.';
        return gl!;
    }

    protected executePrograms(): void {
        for (const program of this.modelPrograms) {
            program.executeProgram();
        }
    }
}
