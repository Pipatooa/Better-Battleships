import { Pattern } from '../scenario/pattern';
import { CanvasInfo } from './canvas-info';
import { GameRenderer } from './game-renderer';

/**
 * PatternRenderer - Client Version
 *
 * Responsible for rendering patterns such as ships
 */
export class PatternRenderer {

    protected patternNeighbourInfo: { [key: string]: number } = {};

    private lastDrawX = -Infinity;
    private lastDrawY = -Infinity;
    private lastCellWidth = 0;
    private rendered = false;

    private readonly onMoveListenerID: number;

    /**
     * PatternRenderer constructor
     *
     * @param  renderer    Base renderer for canvas functions
     * @param  canvas      Canvas to render patterns to
     * @param  pattern     Pattern to render
     * @param  fillColor   Color to draw pattern with
     * @param  borderColor Color to draw pattern border with
     */
    public constructor(protected readonly renderer: GameRenderer,
                       protected readonly canvas: CanvasInfo,
                       protected readonly pattern: Pattern,
                       protected fillColor: string,
                       protected borderColor: string) {

        // Add a listener to update the last known drawn coordinates when the parent canvas is moved
        this.onMoveListenerID = this.canvas.registerOnMoveListener((dx, dy) => {
            this.lastDrawX += dx;
            this.lastDrawY += dy;
        });
    }

    /**
     * Determines the neighbours for each cell of the pattern
     */
    private calculateNeighbours(): void {

        this.patternNeighbourInfo = {};

        // Iterate through all cells in pattern
        for (const patternEntry of this.pattern.patternEntries) {
            
            // Create an entry for cell
            const key = `${patternEntry.x},${patternEntry.y}`;
            this.patternNeighbourInfo[key] = NeighbourFlags.None;
            
            let neighbourKey: string;

            // When checking each neighbour, update the neighbour info of the found neighbour cell
            // and then update the neighbour info of the current cell.

            // Check -x neighbour
            neighbourKey = `${patternEntry.x - 1},${patternEntry.y}`; 
            if (neighbourKey in this.patternNeighbourInfo) {
                this.patternNeighbourInfo[neighbourKey] |= NeighbourFlags.PositiveX;
                this.patternNeighbourInfo[key] |= NeighbourFlags.NegativeX;
            }

            // Check +x neighbour
            neighbourKey = `${patternEntry.x + 1},${patternEntry.y}`;
            if (neighbourKey in this.patternNeighbourInfo) {
                this.patternNeighbourInfo[neighbourKey] |= NeighbourFlags.NegativeX;
                this.patternNeighbourInfo[key] |= NeighbourFlags.PositiveX;
            }
            
            // Check -y neighbour
            neighbourKey = `${patternEntry.x},${patternEntry.y - 1}`;
            if (neighbourKey in this.patternNeighbourInfo) {
                this.patternNeighbourInfo[neighbourKey] |= NeighbourFlags.PositiveY;
                this.patternNeighbourInfo[key] |= NeighbourFlags.NegativeY;
            }

            // Check +y neighbour
            neighbourKey = `${patternEntry.x},${patternEntry.y + 1}`;
            if (neighbourKey in this.patternNeighbourInfo) {
                this.patternNeighbourInfo[neighbourKey] |= NeighbourFlags.NegativeY;
                this.patternNeighbourInfo[key] |= NeighbourFlags.PositiveY;
            }
        }
    }

    /**
     * Renders a pattern to the canvas
     *
     * @param  x           X coordinate of canvas to render to
     * @param  y           Y coordinate of canvas to render to
     * @param  cellWidth   Width of each cell on the canvas
     * @param  borderWidth Border width of the pattern in pixels
     * @param  alpha       Opacity of the drawn pattern
     */
    public render(x: number, y: number, cellWidth: number, borderWidth: number, alpha = 1): void {

        // If pattern is already rendered, de-render pattern
        if (this.rendered)
            this.deRender();

        // Set pattern fill style
        const oldAlpha = this.canvas.context.globalAlpha;
        this.canvas.context.globalAlpha = alpha;
        this.canvas.context.fillStyle = this.fillColor;

        // Iterate through cells in pattern for main rendering
        for (const patternEntry of this.pattern.patternEntries) {

            // Calculate screen position of cell
            const drawX: number = x + patternEntry.x * cellWidth;
            const drawY: number = y + patternEntry.y * cellWidth;

            // Draw basic pattern cell to screen
            this.canvas.context.fillRect(drawX, drawY, cellWidth - 1, cellWidth - 1);
        }

        // TODO: Border rendering
        
        // Reset alpha
        this.canvas.context.globalAlpha = oldAlpha;

        // Record draw parameters for later de-rendering of pattern
        this.lastDrawX = x;
        this.lastDrawY = y;
        this.lastCellWidth = cellWidth;
        this.rendered = true;
    }

    /**
     * De-renders a pattern from the canvas
     */
    public deRender(): void {

        // If pattern is not rendered, do not de-render again
        if (!this.rendered)
            return;

        // Iterate through cells in pattern
        for (const patternEntry of this.pattern.patternEntries) {

            // Calculate screen position of cell
            const drawX: number = this.lastDrawX + patternEntry.x * this.lastCellWidth;
            const drawY: number = this.lastDrawY + patternEntry.y * this.lastCellWidth;

            // Remove cell from canvas
            this.canvas.context.clearRect(drawX - 1, drawY - 1, this.lastCellWidth + 1, this.lastCellWidth + 1);
        }

        // Mark pattern as already de-rendered
        this.rendered = false;
    }

    /**
     * Removes canvas movement listener allowing object to be deconstructed properly
     */
    public deconstruct(): void {
        this.canvas.removeOnMoveListener(this.onMoveListenerID);
    }
}

enum NeighbourFlags {
    None = 0,
    NegativeX = 1,
    PositiveX = 2,
    NegativeY = 4,
    PositiveY = 8
}