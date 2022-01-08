import { game }                   from '../../../game';
import { BoardInfoGenerator }     from '../board-info-generator';
import { ColorAtlas }             from '../color-atlas';
import { BoardProgram }           from '../model-programs/board-program';
import { SelectionInfoGenerator } from '../selection-info-generator';
import { ViewportHandler }        from '../viewport-handler';
import { BoardRenderer }          from './board-renderer';
import { Renderer }               from './renderer';

export class GameRenderer extends BoardRenderer {

    public readonly viewportHandler: ViewportHandler;
    protected readonly boardInfoGenerator: BoardInfoGenerator;
    public readonly selectionInfoGenerator: SelectionInfoGenerator;

    public constructor(colorAtlas: ColorAtlas) {
        const canvas = $('#game-canvas').get(0) as HTMLCanvasElement;
        const gl = Renderer.getContext(canvas);
        super(gl, [new BoardProgram(gl)]);

        game.gameRenderer = this;
        this._board = game.board!;

        const boardLargeDimension = Math.max(...this._board.size);
        const relativeBoardDimensions: [number, number] = [this._board.size[0] / boardLargeDimension, this._board.size[1] / boardLargeDimension];
        const scaleUpperBound = Math.max(this._board.size[0] / relativeBoardDimensions[0], this._board.size[1] / relativeBoardDimensions[1]) * 0.1;
        this.viewportHandler = new ViewportHandler(canvas, this.gl, this.modelPrograms[0], true, relativeBoardDimensions, undefined, scaleUpperBound);
        this.viewportHandler.updateCallback = () => this.renderNext();
        this.boardInfoGenerator = new BoardInfoGenerator(this.gl, this.modelPrograms[0], game.board!);
        this.boardInfoGenerator.highlightRegion(game.spawnRegion!);
        this.boardInfoGenerator.push();
        this.selectionInfoGenerator = new SelectionInfoGenerator(this.gl, this.modelPrograms[0]);
        this.selectionInfoGenerator.push();

        colorAtlas.push(this.gl, this.modelPrograms);
        const backgroundColor = ColorAtlas.colorFromHex('#32628c').map(v => v / 256);
        this.gl.uniform4fv(this.modelPrograms[0].uniformLocations.backgroundColor, [...backgroundColor, 1.0]);
        this.doRender = true;
    }
}
