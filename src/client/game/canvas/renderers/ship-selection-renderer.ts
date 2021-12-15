import { game }                      from '../../game';
import { Board }                     from '../../scenario/board';
import { sendRequest }               from '../../sockets/opener';
import { initiateGameMainUI }        from '../../ui/initiate';
import { ShipPlacer }                from '../../ui/managers/ship-placer';
import { UIManager }                 from '../../ui/managers/ui-manager';
import { VariableVisibilityElement } from '../../ui/variable-visibility-element';
import { BoardInfoGenerator }        from '../board-info-generator';
import { BoardProgram }              from '../model-programs/board-program';
import { SelectionInfoGenerator }    from '../selection-info-generator';
import { ViewportHandler }           from '../viewport-handler';
import { BoardRenderer }             from './board-renderer';
import { Renderer }                  from './renderer';
import type { Rotation }             from '../../../../shared/scenario/objects/common/rotation';
import type { Tile }                 from '../../scenario/board';
import type { Ship }                 from '../../scenario/ship';
import type { ColorAtlas }           from '../color-atlas';

/**
 * ShipSelectionRenderer - Client Version
 *
 * Responsible for rendering ships to the ship selection canvas
 */
export class ShipSelectionRenderer extends BoardRenderer {

    public readonly viewportHandler: ViewportHandler;
    protected readonly boardInfoGenerator: BoardInfoGenerator;
    public readonly selectionInfoGenerator: SelectionInfoGenerator;

    protected readonly _board: Board;

    private readonly allShips: Ship[];

    private readonly ships: Ship[];
    private selectedIndex: number;
    private slotOpen: boolean;

    private readonly nextShipButtonListener: () => void;
    private readonly previousShipButtonListener: () => void;
    private readonly placementDoneButtonListener: () => void;

    private readonly cycleShipButtonContainer: VariableVisibilityElement;
    private readonly nextShipButtonElement: JQuery;
    private readonly previousShipButtonElement: JQuery;
    private readonly placementDoneButton: VariableVisibilityElement;

    private readonly sidebarShipSelectionRemainingCountElement: JQuery;

    /**
     * ShipSelectionRenderer constructor
     *
     * @param  colorAtlas Color atlas for rendering
     * @param  ships      Array of ships to display to the player
     */
    public constructor(colorAtlas: ColorAtlas<string>,
                       ships: Ship[]) {
        const canvas = $('#ship-selection-canvas').get(0) as HTMLCanvasElement;
        const gl = Renderer.getContext(canvas);
        super(gl, [new BoardProgram(gl)]);

        game.shipSelectionRenderer = this;

        this.allShips = ships.slice();

        this.ships = ships;
        this.selectedIndex = 0;
        this.slotOpen = false;
        this._board = this.generateSelectionBoard();

        // JQuery element caching
        this.cycleShipButtonContainer = new VariableVisibilityElement($('#cycle-ship-button-container'));
        this.nextShipButtonElement = $('#next-ship-button');
        this.previousShipButtonElement = $('#previous-ship-button');
        this.placementDoneButton = new VariableVisibilityElement($('#placement-done-button'));
        this.sidebarShipSelectionRemainingCountElement = $('#sidebar-ship-selection-remaining-count');

        // Rendering initialisation
        this.viewportHandler = new ViewportHandler(canvas, this.gl, this.modelPrograms[0], false, 1, [-0.5, -0.5], [2, 2]);
        this.viewportHandler.updateCallback = () => this.renderNext();
        this.boardInfoGenerator = new BoardInfoGenerator(this.gl, this.modelPrograms[0], this._board);
        this.boardInfoGenerator.push();
        this.selectionInfoGenerator = new SelectionInfoGenerator(this.gl, this.modelPrograms[0]);
        this.selectionInfoGenerator.push();
        colorAtlas.push(this.gl, this.modelPrograms);

        for (const ship of ships)
            this._board.addShip(ship, true);

        this.showCurrentShip();

        // Register event listeners
        this.nextShipButtonListener = () => this.cycleNextShip();
        this.previousShipButtonListener = () => this.cyclePreviousShip();
        this.placementDoneButtonListener = () => this.onPlacementDone();
        this.nextShipButtonElement.get(0).addEventListener('click', this.nextShipButtonListener);
        this.previousShipButtonElement.get(0).addEventListener('click', this.previousShipButtonListener);
        this.placementDoneButton.element.get(0).addEventListener('click', this.placementDoneButtonListener);
        this.doRender = true;
    }

    /**
     * Allows this object to be discarded
     */
    private deconstruct(): void {
        this.nextShipButtonElement.get(0).removeEventListener('click', this.nextShipButtonListener);
        this.previousShipButtonElement.get(0).removeEventListener('click', this.previousShipButtonListener);
        this.placementDoneButton.element.get(0).removeEventListener('click', this.placementDoneButtonListener);
    }

    /**
     * Executed before attached programs are executed
     */
    public preRender(): void {
        super.preRender();
        this.boardInfoGenerator.push();
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
                tiles[y][x] = [tileType, [], undefined, undefined];
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
        const x = Math.floor((this._board.size[0] - maxX - 1) / 2);
        const y = Math.floor((this._board.size[1] - maxY - 1) / 2);
        ship.moveTo(x, y);
        this.renderNext();

        const currentUIManager = UIManager.currentManager;
        if (currentUIManager instanceof ShipPlacer)
            currentUIManager.selectedShip = this.ships[this.selectedIndex];
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
        this._board.removeShip(ship, true);
        this.ships.splice(this.selectedIndex, 1);
        this.slotOpen = true;
        this.renderNext();
        this.checkPlacementDone();
        return ship;
    }

    /**
     * Opens a free slot to accept a held ship
     */
    public openSlot(): void {
        this.slotOpen = true;
        const ship = this.ships[this.selectedIndex];
        ship?.moveTo(undefined, undefined);
        this.renderNext();
        this.updateRemainingCount();
        this.checkPlacementDone();
    }

    /**
     * Closes the open slot
     *
     * @param  ship Optional ship to place into free slot
     */
    public closeSlot(ship: Ship | undefined): void {
        if (ship !== undefined) {
            this.ships.splice(this.selectedIndex, 0, ship);
            this._board.addShip(ship, true);
        }

        if (this.ships.length > 0)
            this.selectedIndex %= this.ships.length;

        this.slotOpen = false;
        this.showCurrentShip();
        this.updateRemainingCount();
        this.checkPlacementDone();
    }

    /**
     * Updates remaining ship count display
     */
    private updateRemainingCount(): void {
        let remaining = this.ships.length;
        if (this.slotOpen)
            remaining++;
        this.sidebarShipSelectionRemainingCountElement.text(remaining);
    }

    /**
     * Checks whether there are available ships left to place or being placed
     */
    private checkPlacementDone(): void {
        const placementDone = this.ships.length === 0 && !this.slotOpen;
        this.cycleShipButtonContainer.setVisibility(!placementDone);
        this.placementDoneButton.setVisibility(placementDone);
    }

    /**
     * Called when placement done button is clicked
     */
    private onPlacementDone(): void {
        this.placementDoneButton.element.text('Waiting for other players...');
        this.placementDoneButton.element.attr('disabled', true as any);

        const shipPlacements: [number, number, Rotation][] = [];
        for (const ship of this.allShips)
            shipPlacements.push([ship.x!, ship.y!, ship.rotation]);

        sendRequest({
            request: 'shipPlacement',
            shipPlacements: shipPlacements
        });

        this.deconstruct();
        initiateGameMainUI();
    }

    /**
     * Getters and setters
     */

    public get currentlyShown(): Ship | undefined {
        return this.slotOpen
            ? undefined
            : this.ships[this.selectedIndex];
    }
}
