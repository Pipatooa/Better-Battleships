import { game }                   from '../game';
import { BoardInfoGenerator }     from './board-info-generator';
import { ColorAtlas }             from './color-atlas';
import { BoardProgram }           from './model-programs/board-program';
import { Renderer }               from './renderer';
import { SelectionInfoGenerator } from './selection-info-generator';
import { ViewportHandler }        from './viewport-handler';

export class GameRenderer extends Renderer {

    public readonly viewportHandler: ViewportHandler;
    private readonly boardInfoGenerator: BoardInfoGenerator;
    public readonly selectionInfoGenerator: SelectionInfoGenerator;

    public constructor(colorAtlas: ColorAtlas,
                       spawnRegionID: string) {
        const canvas = $('#game-canvas').get(0) as HTMLCanvasElement;
        const gl = Renderer.getContext(canvas);
        super(gl, [new BoardProgram(gl)]);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendEquation(this.gl.FUNC_ADD);

        game.gameRenderer = this;

        this.viewportHandler = new ViewportHandler(canvas, this.gl, this.modelPrograms[0], true);
        this.boardInfoGenerator = new BoardInfoGenerator(this.gl, this.modelPrograms[0], game.board!, false);
        this.boardInfoGenerator.highlightedRegion = spawnRegionID;
        this.boardInfoGenerator.push();
        this.selectionInfoGenerator = new SelectionInfoGenerator(this.gl, this.modelPrograms[0]);
        this.selectionInfoGenerator.push();

        colorAtlas.push(this.gl, this.modelPrograms);
        const backgroundColor = ColorAtlas.colorFromHex('#32628c').map(v => v / 256);
        this.gl.uniform4fv(this.modelPrograms[0].uniformLocations.backgroundColor, [...backgroundColor, 1.0]);
        this.render();
    }

    /**
     * Re-renders the main game canvas
     */
    private render(): void {
        this.viewportHandler.push();
        // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.executePrograms();
        requestAnimationFrame(() => this.render());
    }
}
