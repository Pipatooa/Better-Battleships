import { game }           from '../game';
import { tooltipManager } from './tooltip-manager';
import type { Ship }      from '../scenario/ship';

export class ShipPlacer {

    private _heldShip: Ship | undefined;

    private readonly lastBoardPosition: [number, number] = [-Infinity, -Infinity];

    public constructor() {
        // Register event handlers
        document.addEventListener('pointermove', (ev) => ShipPlacer.onPointerMove(ev));
        game.shipSelectionRenderer!.viewportHandler.canvas.addEventListener('click', () => this.onSelectionCanvasClick());
        game.gameRenderer!.viewportHandler.canvas.addEventListener('click', (ev) => this.onMainCanvasClick(ev));
    }

    private static onPointerMove(ev: PointerEvent): void {
        {
            const renderer = game.shipSelectionRenderer!;
            const board = renderer.selectionBoard;
            const [ canvasX, canvasY ] = renderer.viewportHandler.screenToCanvasCoordinates(ev.clientX, ev.clientY);
            const [ x, y ] = renderer.viewportHandler.canvasToBoardCoordinates(canvasX, canvasY, board);
            renderer.selectionInfoGenerator.setOffset(x, y);
            renderer.selectionInfoGenerator.push();
            renderer.render();
        }
        {
            const renderer = game.gameRenderer!;
            const board = game.board!;
            const [ canvasX, canvasY ] = renderer.viewportHandler.screenToCanvasCoordinates(ev.clientX, ev.clientY);
            const [ x, y ] = renderer.viewportHandler.canvasToBoardCoordinates(canvasX, canvasY, board);
            renderer.selectionInfoGenerator.setOffset(x, y);
            renderer.selectionInfoGenerator.push();
        }
    }

    private onSelectionCanvasClick(): void {
        if (this._heldShip === undefined) {
            this.heldShip = game.shipSelectionRenderer!.pickup();
        } else {
            game.shipSelectionRenderer!.closeSlot(this._heldShip);
            this.heldShip = undefined;
        }
    }

    private onMainCanvasClick(ev: MouseEvent): void {
        if (this._heldShip === undefined) {
            const [ canvasX, canvasY ] = game.gameRenderer!.viewportHandler.screenToCanvasCoordinates(ev.clientX, ev.clientY);
            const [ x, y ] = game.gameRenderer!.viewportHandler.canvasToBoardCoordinates(canvasX, canvasY, game.board!);
            const tile = game.board!.tiles[Math.floor(y)]?.[Math.floor(x)];
            const ship = tile?.[2];
            if (ship !== undefined) {
                game.board!.removeShip(ship, true);
                game.board!.boardInformationGenerator!.push();
                this.heldShip = ship;
                game.shipSelectionRenderer!.openSlot();
            }
        } else {
            const [ canvasX, canvasY ] = game.gameRenderer!.viewportHandler.screenToCanvasCoordinates(ev.clientX, ev.clientY);
            const [ ptX, ptY ] = game.gameRenderer!.viewportHandler.canvasToBoardCoordinates(canvasX, canvasY, game.board!);
            const x = Math.floor(ptX - this._heldShip.pattern.center[0]);
            const y = Math.floor(ptY - this._heldShip.pattern.center[1]);
            this._heldShip.moveTo(x, y);
            game.board!.addShip(this._heldShip, true);
            game.board!.boardInformationGenerator!.push();
            game.shipSelectionRenderer!.closeSlot(undefined);
            this.heldShip = undefined;
        }
    }

    /**
     * Getters and setters
     */

    public get heldShip(): Ship | undefined {
        return this._heldShip;
    }

    public set heldShip(ship: Ship | undefined) {
        this._heldShip = ship;

        game.shipSelectionRenderer!.selectionInfoGenerator.setSelectionShip(ship);
        game.shipSelectionRenderer!.selectionInfoGenerator.push();
        game.shipSelectionRenderer!.render();
        game.gameRenderer!.selectionInfoGenerator.setSelectionShip(ship);
        game.gameRenderer!.selectionInfoGenerator.push();

        tooltipManager.highlightedShipOverride = ship;
        tooltipManager.updateTooltip();
    }
}
