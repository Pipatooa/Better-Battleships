import { Rotation }  from '../../../../shared/scenario/objects/common/rotation';
import { game }      from '../../game';
import { UIManager } from './ui-manager';
import type { Ship } from '../../scenario/ship';

export class ShipPlacer extends UIManager {

    private placementValid = false;

    private readonly keyPressListener: (ev: KeyboardEvent) => void;

    public constructor() {
        super();
        this.selectedShip = game.shipSelectionRenderer!.currentlyShown!;

        this.keyPressListener = (ev) => this.onKeyPress(ev);
        document.addEventListener('keypress', this.keyPressListener);
    }

    /**
     * Allows this object to be discarded
     */
    protected deconstruct(): void {
        super.deconstruct();
        document.removeEventListener('keypress', this.keyPressListener);
    }

    /**
     * Updates the location of the current selection
     *
     * @param  ev Pointer movement event
     */
    protected updateSelection(ev: PointerEvent): void {
        super.updateSelection(ev);
        game.shipSelectionRenderer!.updateSelectionLocation(ev);
        if (ev.target === game.gameRenderer!.viewportHandler.canvas)
            this.checkPlacementValid();
    }

    /**
     * Checks whether the current ship's placement is valid
     */
    private checkPlacementValid(): void {
        if (this.mainCanvasCoordinates !== undefined && this._heldShip !== undefined) {
            const shipX = Math.floor(this.mainCanvasCoordinates[0] - this._heldShip.pattern.center[0]);
            const shipY = Math.floor(this.mainCanvasCoordinates[1] - this._heldShip.pattern.center[1]);
            const [ placementValid, invalidReason ] = this._heldShip.checkPlacementValid(shipX, shipY, game.board!);
            this.tooltipInfoText = placementValid
                ? undefined
                : [ 'Invalid Placement!', invalidReason! ];
            this.placementValid = placementValid;
        }
    }

    /**
     * Called when the main canvas is clicked on
     */
    protected onMainCanvasClick(): void {
        if (this._heldShip === undefined) {
            const ship = this.highlightedTile?.[2];
            if (ship !== undefined) {
                game.board!.removeShip(ship, true);
                game.shipSelectionRenderer!.openSlot();
                this.heldShip = ship;
                this.selectedShip = ship;
            }
        } else if (this.placementValid) {
            const [rawX, rawY] = this.mainCanvasCoordinates !== undefined
                ? this.mainCanvasCoordinates
                : [-Infinity, -Infinity];
            const x = Math.floor(rawX - this._heldShip.pattern.center[0]);
            const y = Math.floor(rawY - this._heldShip.pattern.center[1]);
            this._heldShip.moveTo(x, y);
            game.board!.addShip(this._heldShip, true);
            game.shipSelectionRenderer!.closeSlot(undefined);
            this.heldShip = undefined;
        }

        game.board!.informationGenerator!.push();
    }

    /**
     * Called when the ship selection canvas is clicked on
     */
    protected onSelectionCanvasClick(): void {
        if (this._heldShip === undefined) {
            this.heldShip = game.shipSelectionRenderer!.pickup();
        } else {
            game.shipSelectionRenderer!.closeSlot(this._heldShip);
            this.heldShip = undefined;
        }
    }

    /**
     * Called when a key is pressed
     *
     * @param  ev Key press event
     */
    protected onKeyPress(ev: KeyboardEvent): void {
        // Rotate held ship
        if (this._heldShip !== undefined && (ev.key === 'r' || ev.key === 'R')) {
            const rotation = ev.key === 'R' ? Rotation.Clockwise270 : Rotation.Clockwise90;
            this._heldShip.rotate(rotation);
            this.heldShip = this._heldShip;
            this.checkPlacementValid();
            this.updateTooltip();
        }
    }

    /**
     * Getters and setters
     */

    private set heldShip(ship: Ship | undefined) {
        game.shipSelectionRenderer!.selectionInfoGenerator.setSelectionShip(ship);
        game.shipSelectionRenderer!.selectionInfoGenerator.push();
        game.shipSelectionRenderer!.renderNext();
        game.gameRenderer!.selectionInfoGenerator.setSelectionShip(ship);
        game.gameRenderer!.selectionInfoGenerator.push();
        game.gameRenderer!.renderNext();
        this._heldShip = ship;
        this.updateTooltip();
    }

    public set selectedShip(ship: Ship | undefined) {
        this._selectedShip = ship;
        this.updateSidebar();
    }
}
