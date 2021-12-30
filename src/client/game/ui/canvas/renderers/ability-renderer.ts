import { game }                   from '../../../game';
import { AbilityMove }            from '../../../scenario/abilities/ability-move';
import { Board }                  from '../../../scenario/board';
import { TileType }               from '../../../scenario/tiletype';
import { BoardInfoGenerator }     from '../board-info-generator';
import { BoardProgram }           from '../model-programs/board-program';
import { SelectionInfoGenerator } from '../selection-info-generator';
import { ViewportHandler }        from '../viewport-handler';
import { BoardRenderer }          from './board-renderer';
import { Renderer }               from './renderer';
import type { Ability }           from '../../../scenario/abilities/ability';
import type { Tile }              from '../../../scenario/board';
import type { ColorAtlas }        from '../color-atlas';

/**
 * AbilityRenderer
 *
 * Renders ability canvas
 */
export class AbilityRenderer extends BoardRenderer {

    public readonly viewportHandler: ViewportHandler;
    public readonly selectionInfoGenerator: SelectionInfoGenerator;

    private readonly moveValidTileType: TileType;
    private readonly moveOriginTileType: TileType;

    public constructor(colorAtlas: ColorAtlas<'moveValid' | 'moveOrigin'>) {
        const canvas = $('#ability-canvas').get(0) as HTMLCanvasElement;
        const gl = Renderer.getContext(canvas);
        super(gl, [new BoardProgram(gl)]);

        // Initialise renderer
        game.abilityRenderer = this;
        this.viewportHandler = new ViewportHandler(canvas, this.gl, this.modelPrograms[0], false, 1, [-0.5, -0.5], [2, 2]);
        this.viewportHandler.updateCallback = () => this.renderNext();
        this.selectionInfoGenerator = new SelectionInfoGenerator(this.gl, this.modelPrograms[0]);
        this.selectionInfoGenerator.push();
        colorAtlas.push(this.gl, this.modelPrograms);

        // Special tile types
        this.moveValidTileType = new TileType({
            name: 'Valid Move',
            description: 'This ship is allowed to move here'
        }, '', false);
        this.moveOriginTileType = new TileType({
            name: 'Current Position',
            description: ''
        }, '', false);
        this.moveValidTileType.colorPaletteIndex = colorAtlas.specialColorIndices.moveValid;
        this.moveOriginTileType.colorPaletteIndex = colorAtlas.specialColorIndices.moveOrigin;
        this.doRender = true;
    }

    /**
     * Generate board for a movement ability
     *
     * @param    ability Relevant ability
     * @returns          Created Board
     */
    private generateMoveAbilityBoard(ability: AbilityMove): Board {
        const tiles: Tile[][] = [];
        const [patternBoundX, patternBoundY] = ability.pattern.getBounds();

        const boardSize = Math.max(patternBoundX, patternBoundY) + 3;
        const offsetX = Math.floor((boardSize - patternBoundX - 1) / 2);
        const offsetY = Math.floor((boardSize - patternBoundY - 1) / 2);

        for (let y = 0; y < boardSize; y++) {
            tiles[y] = [];
            for (let x = 0; x < boardSize; x++) {
                const patternX = x - offsetX;
                const patternY = y - offsetY;

                const dx = patternX - ability.pattern.center[0];
                const dy = patternY - ability.pattern.center[1];

                if (dx === 0 && dy === 0)
                    tiles[y][x] = [this.moveOriginTileType, [], undefined, undefined];
                else if (ability.pattern.query(patternX, patternY))
                    tiles[y][x] = [this.moveValidTileType, [], undefined, () => ability.use(dx, dy)];
                else
                    tiles[y][x] = [game.board!.primaryTileType, [], undefined, undefined];
            }
        }

        return new Board(tiles, [this.moveOriginTileType, this.moveValidTileType], game.board!.primaryTileType);
    }

    /**
     * Renders complementary board display for a ship
     *
     * @param  ability Ability to display information for
     */
    public renderAbility(ability: Ability): void {
        if (ability instanceof AbilityMove) {
            this._board = this.generateMoveAbilityBoard(ability);
            this.boardInfoGenerator = new BoardInfoGenerator(this.gl, this.modelPrograms[0], this._board);
            this.boardInfoGenerator.push();
        }
        this.renderNext();
    }

    /**
     * Getters and setters
     */

    public get board(): Board | undefined {
        return this._board;
    }
}
