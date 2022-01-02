import { game }                   from '../../../game';
import { SidebarElements }        from '../../element-cache';
import { BoardInfoGenerator }     from '../board-info-generator';
import { BoardProgram }           from '../model-programs/board-program';
import { SelectionInfoGenerator } from '../selection-info-generator';
import { ViewportHandler }        from '../viewport-handler';
import { BoardRenderer }          from './board-renderer';
import { Renderer }               from './renderer';
import type { Ability }           from '../../../scenario/abilities/ability';
import type { Board }             from '../../../scenario/board';

import type { ColorAtlas } from '../color-atlas';

/**
 * AbilityRenderer
 *
 * Renders ability canvas
 */
export class AbilityRenderer extends BoardRenderer {

    public readonly viewportHandler: ViewportHandler;
    public readonly selectionInfoGenerator: SelectionInfoGenerator;

    private readonly colorAtlas: ColorAtlas<'moveValid' | 'moveOrigin'>;

    public constructor(colorAtlas: ColorAtlas<'moveValid' | 'moveOrigin'>) {
        const canvas = $('#ability-canvas').get(0) as HTMLCanvasElement;
        const gl = Renderer.getContext(canvas);
        super(gl, [new BoardProgram(gl)]);
        this.colorAtlas = colorAtlas;

        // Initialise renderer
        game.abilityRenderer = this;
        this.viewportHandler = new ViewportHandler(canvas, this.gl, this.modelPrograms[0], false, 1, 1, 1, [-0.5, -0.5], [2, 2]);
        this.viewportHandler.updateCallback = () => this.renderNext();
        this.selectionInfoGenerator = new SelectionInfoGenerator(this.gl, this.modelPrograms[0]);
        this.selectionInfoGenerator.push();
        this.colorAtlas.push(this.gl, this.modelPrograms);

        this.doRender = true;
    }

    /**
     * Renders complementary board display for a ship
     *
     * @param  ability Ability to display information for
     */
    public renderAbility(ability: Ability): void {
        this._board = ability.generateAbilityBoard(this.colorAtlas);

        SidebarElements.shipAbilityCanvasWrapper.setVisibility(this._board !== undefined);
        if (this._board !== undefined) {
            this.boardInfoGenerator = new BoardInfoGenerator(this.gl, this.modelPrograms[0], this._board);
            this.boardInfoGenerator.push();
            this.viewportHandler.updateViewport(true);
            this.renderNext();
        }
    }

    /**
     * Getters and setters
     */

    public get board(): Board | undefined {
        return this._board;
    }
}
