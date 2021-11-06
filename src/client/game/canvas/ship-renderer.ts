import { allShips } from '../scenario/ship';
import type { GameRenderer } from './game-renderer';
import { PatternRenderer } from './pattern-renderer';

/**
 * ShipRenderer - Client Version
 *
 * Responsible for rendering ships to game canvases
 */
export class ShipRenderer {

    /**
     * ShipRenderer constructor
     *
     * @param  renderer Base renderer for canvas functions
     */
    public constructor(protected readonly renderer: GameRenderer) {

        // Create pattern renderers for all ships
        for (const ship of allShips) {
            ship.patternRenderer = new PatternRenderer(this.renderer, this.renderer.shipCanvas, ship.pattern, ship.player.color!, ship.player.team!.color);
        }

    }

    /**
     * Renders all visible ships to the ship canvas
     *
     * @param  x Minimum x to draw from
     * @param  y Minimum y to draw from
     * @param  w Width of region to redraw
     * @param  h Height of region to redraw
     */
    public redrawRegion(x: number, y: number, w: number, h: number): void {

        // Clear region to be redrawn
        this.renderer.shipCanvas.context.clearRect(x, y, w, h);

        // Translate redraw region bounds to board coordinates
        const [boardXMin, boardYMin] = this.renderer.boardRenderer.translatePixelCoordinateBoard(x, y);
        const [boardXMax, boardYMax] = this.renderer.boardRenderer.translatePixelCoordinateBoard(x + w, y + h);

        // Iterate through ships for rendering
        for (const ship of allShips) {

            // If ship is not being rendered, skip
            if (!ship.doRender)
                continue;

            // Check that ship is within bounds of pixel redraw region
            const [xMax, yMax] = ship.pattern.getBounds();

            if (ship.x > boardXMax || ship.x + xMax < boardXMin ||
                ship.y > boardYMax || ship.y + yMax < boardYMin)
                continue;

            // Translate board coordinates to ship canvas pixel coordinates
            const [drawX, drawY] = this.renderer.boardRenderer.translateBoardCoordinatePixel(ship.x, ship.y);

            // Render pattern to ship canvas
            ship.patternRenderer!.render(drawX, drawY, this.renderer.boardRenderer.gridCellSize, 0);
        }
    }

    /**
     * Redraws all ships
     */
    public redrawAll(): void {
        this.redrawRegion(0, 0, this.renderer.shipCanvas.canvas.width, this.renderer.shipCanvas.canvas.height);
    }
}
