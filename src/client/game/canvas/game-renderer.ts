import { Board } from '../scenario/board';
import { BoardRenderer } from './board-renderer';
import { CanvasInfo } from './canvas-info';

export let gameRenderer: GameRenderer;

/**
 * GameRenderer - Client Version
 *
 * Base class for rendering objects to the canvas
 */
export class GameRenderer {
    
    public readonly boardCanvas: CanvasInfo;
    public readonly shipCanvas: CanvasInfo;
    public readonly shipSelectionCanvas: CanvasInfo;
    
    public readonly boardRenderer: BoardRenderer;

    protected _pixelScale = 1;

    /**
     * GameRenderer constructor
     *
     * Initialises all canvases and renderers
     *
     * @param  board Board to pass to board renderer
     */
    public constructor(board: Board) {

        let boardCanvasElement = $('#board-canvas').get(0) as HTMLCanvasElement;
        let shipCanvasElement = $('#ship-canvas').get(0) as HTMLCanvasElement;
        let shipSelectionCanvasElement = $('#ship-selection-canvas').get(0) as HTMLCanvasElement;

        this.boardCanvas = new CanvasInfo(boardCanvasElement, this._pixelScale);
        this.shipCanvas = new CanvasInfo(shipCanvasElement, this._pixelScale);
        this.shipSelectionCanvas = new CanvasInfo(shipSelectionCanvasElement, this._pixelScale);
        
        // Create renderers
        this.boardRenderer = new BoardRenderer(this, board);

        // Register event listeners
        $(window).on('resize', () => this.onResize());
    }

    /**
     * Called when window is resized
     */
    private onResize(): void {
        this.boardCanvas.onResize();
        this.shipCanvas.onResize();
        this.shipSelectionCanvas.onResize();

        this.boardRenderer.redrawAll();
    }

    /**
     * Getters and setters
     */

    public get pixelScale(): number {
        return this._pixelScale;
    }
}

/**
 * Creates singleton GameRenderer
 *
 * @param  board Board to pass to game renderer
 */
export function initGameRenderer(board: Board): void {
    gameRenderer = new GameRenderer(board);
}
