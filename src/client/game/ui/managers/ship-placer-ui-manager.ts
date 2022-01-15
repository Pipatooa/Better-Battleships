import { Rotation }      from 'shared/scenario/rotation';
import { game }          from '../../game';
import { UIManager }     from './ui-manager';
import {
    createView,
    removeView,
    selectView,
    setDefaultView,
    updateCurrentView
} from './view-manager';
import type { Ship } from 'client/game/scenario/ship';

/**
 * ShipPlacerUiManager - Client Version
 *
 * Responsible for updating main UI elements during the setup phase
 */
export class ShipPlacerUiManager extends UIManager {

    protected readonly includeSelectedShipInVisibilityView = false;
    private placementValid = false;

    private readonly keyPressListener: (ev: KeyboardEvent) => void;

    public constructor() {
        super();
        this.setSelectedShip(game.shipSelectionRenderer!.currentlyShown);

        this.keyPressListener = (ev) => this.onKeyPress(ev);
        document.addEventListener('keypress', this.keyPressListener);

        createView('Placement', () => {
            game.board!.informationGenerator!.highlightRegion(game.spawnRegion!);
            game.board!.informationGenerator!.push();
            game.gameRenderer!.renderNext();
        }, () => {}, 'P');

        selectView('Placement');
        setDefaultView('Placement');
    }

    /**
     * Allows this object to be discarded
     */
    protected deconstruct(): void {
        super.deconstruct();
        document.removeEventListener('keypress', this.keyPressListener);

        setDefaultView('Normal');
        removeView('Placement');
    }

    /**
     * Updates the location of the current selection
     *
     * @param  ev Pointer movement event
     */
    protected updateSelection(ev: PointerEvent): void {
        super.updateSelection(ev);
        game.shipSelectionRenderer!.updateSelectionLocation(ev);

        if (this._mainCanvasCoordinates !== undefined && this.heldShip !== undefined) {
            const [oldX, oldY] = this.heldShipCoordinates;
            const newX = Math.floor(this._mainCanvasCoordinates[0] - this.heldShip.pattern.center[0]);
            const newY = Math.floor(this._mainCanvasCoordinates[1] - this.heldShip.pattern.center[1]);
            if (newX !== oldX || newY !== oldY) {
                this.heldShip.moveTo(newX, newY);
                this.heldShipCoordinates = [newX, newY];
                updateCurrentView();
                this.checkPlacementValid();
                game.board!.informationGenerator!.push();
                game.gameRenderer!.renderNext();
            }
        }
    }

    /**
     * Checks whether the current ship's placement is valid
     */
    private checkPlacementValid(): void {
        if (this._mainCanvasCoordinates !== undefined && this.heldShip !== undefined) {
            const [ placementValid, invalidReason ] = this.heldShip.checkPlacementValid(...this.heldShipCoordinates, game.board!);
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
        // Pickup ship
        if (this.heldShip === undefined) {
            const ship = this.highlightedTile?.[2];
            if (ship !== undefined) {
                game.board!.removeShip(ship, true);
                game.shipSelectionRenderer!.openSlot();
                this.setHeldShip(ship);
                this.setSelectedShip(ship);
                ship.placed = false;
            }
        // Put down ship
        } else if (this.placementValid) {
            this.heldShip.moveTo(...this.heldShipCoordinates);
            game.board!.addShip(this.heldShip, true);
            game.shipSelectionRenderer!.closeSlot(undefined);
            this.heldShip.placed = true;
            this.setHeldShip(undefined);
        }

        game.board!.informationGenerator!.push();
    }

    /**
     * Called when the ship selection canvas is clicked on
     */
    protected onSelectionCanvasClick(): void {
        // Pickup ship
        if (this.heldShip === undefined)
            this.setHeldShip(game.shipSelectionRenderer!.pickup());
        // Put down ship
        else {
            game.shipSelectionRenderer!.closeSlot(this.heldShip);
            this.setHeldShip(undefined);
        }
    }

    /**
     * Called when a key is pressed
     *
     * @param  ev Key press event
     */
    protected onKeyPress(ev: KeyboardEvent): void {
        // Rotate held ship
        if (this.heldShip !== undefined && ev.key.toLowerCase() === 'r') {
            const rotation = ev.key === 'R' ? Rotation.Clockwise270 : Rotation.Clockwise90;
            this.heldShip.rotate(rotation);

            game.shipSelectionRenderer!.selectionInfoGenerator.setSelectionShip(this.heldShip);
            game.shipSelectionRenderer!.selectionInfoGenerator.push();
            game.shipSelectionRenderer!.renderNext();
            game.gameRenderer!.selectionInfoGenerator.setSelectionShip(this.heldShip);
            game.gameRenderer!.selectionInfoGenerator.push();
            updateCurrentView();
            this.checkPlacementValid();
            this.updateTooltip();
            game.board!.informationGenerator!.push();
            game.gameRenderer!.renderNext();
        }
    }

    /**
     * Sets the currently selected ship and updates the UI and renderer state accordingly
     *
     * @param  ship Ship to select
     */
    public setSelectedShip(ship: Ship | undefined): void {
        super.setSelectedShip(ship);
    }
}
