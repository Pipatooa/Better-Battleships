import { game }                   from '../game';
import { Board }                  from '../scenario/board';
import { BoardInfoGenerator }     from './board-info-generator';
import { BoardProgram }           from './model-programs/board-program';
import { Renderer }               from './renderer';
import { SelectionInfoGenerator } from './selection-info-generator';
import { ViewportHandler }        from './viewport-handler';
import type { Tile }              from '../scenario/board';
import type { Ship }              from '../scenario/ship';
import type { ColorAtlas }        from './color-atlas';

export class ShipSelectionRenderer extends Renderer {

    public readonly viewportHandler: ViewportHandler;
    private readonly boardInfoGenerator: BoardInfoGenerator;
    public readonly selectionInfoGenerator: SelectionInfoGenerator;

    private readonly ships: Ship[];
    private selectedIndex: number;
    private slotOpen: boolean;

    public readonly selectionBoard: Board;

    public constructor(colorAtlas: ColorAtlas,
                       ships: Ship[]) {
        const canvas = $('#ship-selection-canvas').get(0) as HTMLCanvasElement;
        const gl = Renderer.getContext(canvas);
        super(gl, [new BoardProgram(gl)]);

        game.shipSelectionRenderer = this;

        this.ships = ships;
        this.selectedIndex = 0;
        this.slotOpen = false;
        this.selectionBoard = this.generateSelectionBoard();
        
        this.viewportHandler = new ViewportHandler(canvas, this.gl, this.modelPrograms[0], false, 1, [-0.5, -0.5], [2, 2]);
        this.viewportHandler.resizeCallback = () => this.render();
        this.boardInfoGenerator = new BoardInfoGenerator(this.gl, this.modelPrograms[0], this.selectionBoard, false);
        this.boardInfoGenerator.push();
        this.selectionInfoGenerator = new SelectionInfoGenerator(this.gl, this.modelPrograms[0]);
        this.selectionInfoGenerator.push();

        for (const ship of ships) {
            this.selectionBoard.addShip(ship, true);
        }

        colorAtlas.push(this.gl, this.modelPrograms);
        this.showCurrentShip();

        $('#next-ship-button').get(0).addEventListener('click', () => this.cycleNextShip());
        $('#previous-ship-button').get(0).addEventListener('click', () => this.cyclePreviousShip());
    }

    /**
     * Generates a board to display available ships upon
     *
     * @returns  Created board
     */
    private generateSelectionBoard(): Board {
        
        const tiles: Tile[][] = [];
        
        // Find maximum length of ship
        let maxLength = 0;
        for (const ship of this.ships) {
            const [maxX, maxY] = ship.pattern.getBounds();
            maxLength = Math.max(maxLength, maxX + 1, maxY + 1);
        }

        // Populate tile array
        const tileType = game.board!.primaryTileType;
        const boardSize = maxLength + 2;
        for (let y = 0; y < boardSize; y++) {
            tiles[y] = [];
            for (let x = 0; x < boardSize; x++) {
                tiles[y][x] = [tileType, [], undefined];
            }
        }
        
        return new Board(tiles, game.board!.tileTypes, tileType);
    }

    /**
     * Displays the next ship which can be placed
     */
    private cycleNextShip(): void {
        if (this.ships.length === 0 || this.slotOpen)
            return;

        const oldCurrentShip = this.ships[this.selectedIndex];
        oldCurrentShip.moveTo(undefined, undefined);

        this.selectedIndex++;
        this.selectedIndex %= this.ships.length;
        this.showCurrentShip();
    }

    /**
     * Displays the previous ship which can be placed
     */
    private cyclePreviousShip(): void {
        if (this.ships.length === 0 || this.slotOpen)
            return;

        const oldCurrentShip = this.ships[this.selectedIndex];
        oldCurrentShip.moveTo(undefined, undefined);

        this.selectedIndex = this.selectedIndex - 1 + this.ships.length;
        this.selectedIndex %= this.ships.length;
        this.showCurrentShip();
    }

    /**
     * Displays the currently selected ship in the center of the board
     */
    private showCurrentShip(): void {
        if (this.ships.length === 0 || this.slotOpen)
            return;
        
        const ship = this.ships[this.selectedIndex];
        const [maxX, maxY] = ship.pattern.getBounds();

        // Center ship
        const x = Math.floor((this.selectionBoard.size[0] - maxX - 1) / 2);
        const y = Math.floor((this.selectionBoard.size[1] - maxY - 1) / 2);
        ship.moveTo(x, y);
        this.render();
    }

    /**
     * Picks up the currently displayed ship
     *
     * @returns  Ship which was picked up
     */
    public pickup(): Ship | undefined {
        if (this.ships.length === 0)
            return undefined;

        const ship = this.ships[this.selectedIndex];
        this.selectionBoard.removeShip(ship, true);
        this.ships.splice(this.selectedIndex, 1);
        this.slotOpen = true;
        return ship;
    }

    /**
     * Opens a free slot to accept a held ship
     */
    public openSlot(): void {
        this.slotOpen = true;
        const ship = this.ships[this.selectedIndex];
        ship?.moveTo(undefined, undefined);
    }

    /**
     * Closes the open slot
     *
     * @param  ship Optional ship to place into free slot
     */
    public closeSlot(ship: Ship | undefined): void {
        if (ship !== undefined) {
            this.ships.splice(this.selectedIndex, 0, ship);
            this.selectionBoard.addShip(ship, true);
        }

        if (this.ships.length > 0)
            this.selectedIndex %= this.ships.length;

        this.slotOpen = false;
        this.showCurrentShip();
    }

    /**
     * Re-renders the ship selection canvas
     */
    public render(): void {
        this.boardInfoGenerator.push();
        this.gl.clearColor(0, 0, 0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.executePrograms();
    }
}
