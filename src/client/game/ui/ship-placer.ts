import { game }      from '../game';
import { UIManager } from './ui-manager';
import type { Ship } from '../scenario/ship';

export class ShipPlacer extends UIManager {

    public constructor() {
        super();
        this.selectedShip = game.shipSelectionRenderer!.currentlyShown!;
    }


    protected updateSelection(ev: PointerEvent): void {
        super.updateSelection(ev);

        const renderer = game.shipSelectionRenderer!;
        const board = renderer.selectionBoard;
        const [ canvasX, canvasY ] = renderer.viewportHandler.screenToCanvasCoordinates(ev.clientX, ev.clientY);
        const [ x, y ] = renderer.viewportHandler.canvasToBoardCoordinates(canvasX, canvasY, board);
        renderer.selectionInfoGenerator.setOffset(x, y);
        renderer.selectionInfoGenerator.push();
        game.shipSelectionRenderer!.render();
    }

    protected onMainCanvasClick(): void {
        if (this._heldShip === undefined) {
            const ship = this.highlightedTile?.[2];
            if (ship !== undefined) {
                game.board!.removeShip(ship, true);
                game.board!.boardInformationGenerator!.push();
                this.heldShip = ship;
                this.selectedShip = ship;
                game.shipSelectionRenderer!.openSlot();
            }
        } else {
            const x = Math.floor(this.highlightedLocationRaw[0] - this._heldShip.pattern.center[0]);
            const y = Math.floor(this.highlightedLocationRaw[1] - this._heldShip.pattern.center[1]);
            this._heldShip.moveTo(x, y);
            game.board!.addShip(this._heldShip, true);
            game.board!.boardInformationGenerator!.push();
            game.shipSelectionRenderer!.closeSlot(undefined);
            this.heldShip = undefined;
        }
    }

    protected onSelectionCanvasClick(): void {
        if (this._heldShip === undefined) {
            this.heldShip = game.shipSelectionRenderer!.pickup();
        } else {
            game.shipSelectionRenderer!.closeSlot(this._heldShip);
            this.heldShip = undefined;
        }
    }

    /**
     * Getters and setters
     */

    private set heldShip(ship: Ship | undefined) {
        game.shipSelectionRenderer!.selectionInfoGenerator.setSelectionShip(ship);
        game.shipSelectionRenderer!.selectionInfoGenerator.push();
        // game.shipSelectionRenderer!.render();
        game.gameRenderer!.selectionInfoGenerator.setSelectionShip(ship);
        game.gameRenderer!.selectionInfoGenerator.push();
        this._heldShip = ship;
        this.updateTooltip();
    }

    public set selectedShip(ship: Ship | undefined) {
        this._selectedShip = ship;
        this.updateSidebar();
    }
}
