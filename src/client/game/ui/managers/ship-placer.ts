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

    protected updateSelection(ev: PointerEvent): ([number, number] | undefined)[] {
        const [mainCoordinates, abilityCoordinates] = super.updateSelection(ev);
        const shipSelectionCoordinates = game.shipSelectionRenderer!.updateSelectionLocation(ev);

        // Update info text if hovering over the main board with a ship
        if (mainCoordinates !== undefined && this._heldShip !== undefined
                && ev.target === game.gameRenderer!.viewportHandler.canvas) {

            const shipX = Math.floor(mainCoordinates[0] - this._heldShip.pattern.center[0]);
            const shipY = Math.floor(mainCoordinates[1] - this._heldShip.pattern.center[1]);
            const [ placementValid, invalidReason ] = this._heldShip.checkPlacementValid(shipX, shipY, game.board!);
            this.tooltipInfoText = placementValid
                ? undefined
                : [ 'Invalid Placement!', invalidReason! ];
            this.placementValid = placementValid;
        }

        return [mainCoordinates, abilityCoordinates, shipSelectionCoordinates];
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
            const x = Math.floor(this.highlightedLocationRaw[0] - this._heldShip.pattern.center[0]);
            const y = Math.floor(this.highlightedLocationRaw[1] - this._heldShip.pattern.center[1]);
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
