import { Renderer }                    from './renderer';
import type { Board }                  from '../../../scenario/board';
import type { BoardInfoGenerator }     from '../board-info-generator';
import type { SelectionInfoGenerator } from '../selection-info-generator';

/**
 * BoardRenderer - Client Version
 *
 * Base class for all renderers with an attached board
 */
export abstract class BoardRenderer extends Renderer {

    protected _board: Board | undefined;
    protected boardInfoGenerator: BoardInfoGenerator | undefined;
    public abstract readonly selectionInfoGenerator: SelectionInfoGenerator;

    /**
     * Updates the location of the current selection on the board
     *
     * @param    ev Pointer movement event
     * @returns     Non-rounded board coordinates corresponding to mouse position
     */
    public updateSelectionLocation(ev: PointerEvent): [number, number] | undefined {
        if (this._board === undefined)
            return undefined;

        const [canvasX, canvasY] = this.viewportHandler.screenToCanvasCoordinates(ev.clientX, ev.clientY);
        const [x, y] = this.viewportHandler.canvasToBoardCoordinates(canvasX, canvasY, this._board);
        const changed = this.selectionInfoGenerator.setOffset(x, y);

        if (changed) {
            this.selectionInfoGenerator.push();
            this.renderNext();
        }

        return [x, y];
    }
}
