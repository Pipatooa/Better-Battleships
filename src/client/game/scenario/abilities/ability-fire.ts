import { SubAbilityUsability, subAbilityUsabilityIndexOffset } from 'shared/network/scenario/ability-usability-info';
import { game }                                                from '../../game';
import { sendRequest }                                         from '../../sockets/opener';
import { UIManager }                                           from '../../ui/managers/ui-manager';
import {
    createView,
    removeView,
    selectView,
    updateViewIfActive
} from '../../ui/managers/view-manager';
import { AttributeCollection }            from '../attribute-collection';
import { Board }                          from '../board';
import { Descriptor }                     from '../descriptor';
import { RotatablePattern }               from '../rotatable-pattern';
import { TileType }                       from '../tiletype';
import { Ability }                        from './ability';
import type { ColorAtlas }                from '../../ui/canvas/color-atlas';
import type { Tile }                      from '../board';
import type { Ship }                      from '../ship';
import type { IAbilityFireInfo }          from 'shared/network/scenario/ability-info';
import type { IAbilityFireUsabilityInfo } from 'shared/network/scenario/ability-usability-info';
import type { Rotation }                  from 'shared/scenario/rotation';

/**
 * AbilityFire - Client Version
 *
 * Ability which acts upon a selected group of cells upon its use
 */
export class AbilityFire extends Ability {

    // Unknown, Invalid, Valid tile types for fire position board representation
    private static readonly fireTileTypes = [
        new TileType(new Descriptor('Unknown Fire', "It is unknown if this ship can fire on this location. We don't know enough information"), '', false),
        new TileType(new Descriptor('Invalid Fire', "Can't fire on this location"), '', false),
        new TileType(new Descriptor('Fire', 'Fire on this location'), '', false)
    ];

    // Other tile types for board representation
    public static readonly originTileType = new TileType(new Descriptor('Current Position', ''), '', false);

    /**
     * AbilityFire constructor
     *
     * @param  ship                Ship that this ability belongs to
     * @param  index               Index of this ability in ship's ability list
     * @param  descriptor          Descriptor for ability
     * @param  icon                Url to icon for this ability
     * @param  selectionPattern    Pattern determining which cell can be selected to apply the affect pattern around
     * @param  effectPattern       Pattern determining which cells around the selected cell are affected
     * @param  attributeCollection Attribute for this ability
     * @param  usable              Whether this ability is usable
     */
    public constructor(ship: Ship,
                       index: number,
                       descriptor: Descriptor,
                       icon: string,
                       private selectionPattern: RotatablePattern,
                       private effectPattern: RotatablePattern,
                       attributeCollection: AttributeCollection,
                       usable: boolean) {
        super(ship, index, descriptor, icon, attributeCollection, usable);
    }

    /**
     * Factory function to generate AbilityFire from transportable JSON
     *
     * @param    abilityFireInfo JSON data for AbilityFire
     * @param    ship            Ship that this ability belongs to
     * @param    index           Index of this ability in ship's ability list
     * @returns                  Created AbilityFire object
     */
    public static fromInfo(abilityFireInfo: IAbilityFireInfo, ship: Ship, index: number): AbilityFire {
        const descriptor = Descriptor.fromInfo(abilityFireInfo.descriptor);
        const selectionPattern = RotatablePattern.fromInfo(abilityFireInfo.usability.pattern);
        const effectPattern = RotatablePattern.fromInfo(abilityFireInfo.effectPattern);
        const attributeCollection = new AttributeCollection(abilityFireInfo.attributes);
        return new AbilityFire(ship, index, descriptor, abilityFireInfo.icon, selectionPattern, effectPattern, attributeCollection, abilityFireInfo.usability.usable);
    }

    /**
     * Updates this ability's usability from update data sent by the server
     *
     * @param  usabilityUpdate Ability usability update object
     */
    public updateUsability(usabilityUpdate: boolean | IAbilityFireUsabilityInfo): void {
        if (usabilityUpdate === true || usabilityUpdate === false) {
            this.usable = usabilityUpdate;
            return;
        }

        this.usable = usabilityUpdate.usable;
        this.selectionPattern = RotatablePattern.fromInfo(usabilityUpdate.pattern);
        this.boardChangedCallback?.();
    }

    /**
     * Generates a board representing possible actions for this ability
     *
     * @param    colorAtlas Color atlas to use for tile colors
     * @returns             No board for this ability
     */
    public generateAbilityBoard(colorAtlas: ColorAtlas): Board {
        const tiles: Tile[][] = [];
        const [xMin, xMax, yMin, yMax] = this.selectionPattern.bounds;

        const boardSize = Math.max(xMax - xMin, yMax - yMin) + 3;
        const offsetX = Math.floor((boardSize + xMin - xMax - 1) / 2);
        const offsetY = Math.floor((boardSize - yMin - yMax - 1) / 2);

        AbilityFire.fireTileTypes[0].colorPaletteIndex = colorAtlas.specialColorIndices.unknown;
        AbilityFire.fireTileTypes[1].colorPaletteIndex = colorAtlas.specialColorIndices.invalid;
        AbilityFire.fireTileTypes[2].colorPaletteIndex = colorAtlas.specialColorIndices.valid;
        AbilityFire.originTileType.colorPaletteIndex = colorAtlas.specialColorIndices.origin;

        const hoverCallback = (): void => updateViewIfActive('Ability');

        // Convert pattern values into board tiles
        for (let y = 0; y < boardSize; y++) {
            tiles[y] = [];
            for (let x = 0; x < boardSize; x++) {
                const patternX = x - offsetX;
                const patternY = y - offsetY;

                const dx = patternX - this.selectionPattern.center[0];
                const dy = patternY - this.selectionPattern.center[1];

                // Origin
                if (dx === 0 && dy === 0) {
                    tiles[y][x] = [AbilityFire.originTileType, [], undefined, hoverCallback, undefined];
                    continue;
                }

                // Normal tile
                const patternValue = this.selectionPattern.query(patternX, patternY);
                if (patternValue === SubAbilityUsability.NotUsable)
                    tiles[y][x] = [game.board!.primaryTileType, [], undefined, hoverCallback, undefined];

                // Tile representing move
                else {
                    const tileType = AbilityFire.fireTileTypes[patternValue + subAbilityUsabilityIndexOffset];
                    const clickCallback = patternValue === SubAbilityUsability.Valid
                        ? (): void => this.use(dx, dy)
                        : undefined;
                    tiles[y][x] = [tileType, [], undefined, hoverCallback, clickCallback];
                }
            }
        }

        return new Board(tiles, [], game.board!.primaryTileType, false);
    }

    /**
     * Creates a view for showing contextual information about this ability
     */
    public createAbilityView(): void {
        super.createAbilityView();
        createView('Ability', () => {
            if (!this.ship.placed && this.ship !== UIManager.currentManager!.heldShip)
                return;

            game.board!.informationGenerator!.clearHighlight();

            // Show currently targeted position if hovering over ability board location
            let updated = false;
            if (UIManager.currentManager!.hoveredAbilityLocation !== undefined) {
                const x = UIManager.currentManager!.hoveredAbilityLocation[0] - 1;
                const y = UIManager.currentManager!.hoveredAbilityLocation[1] - 1;

                // Only show if valid shooting location
                const patternValue = this.selectionPattern.query(x, y);
                if (patternValue === SubAbilityUsability.Unknown || patternValue === SubAbilityUsability.Valid) {
                    updated = true;
                    const dx = x - this.selectionPattern.integerCenter[0];
                    const dy = y - this.selectionPattern.integerCenter[1];
                    const patternX = this.ship.x! + this.ship.pattern.integerCenter[0] + dx - this.effectPattern.integerCenter[0];
                    const patternY = this.ship.y! + this.ship.pattern.integerCenter[1] + dy - this.effectPattern.integerCenter[1];
                    game.board!.informationGenerator!.highlightPattern(patternX, patternY, this.effectPattern);
                }
            }

            // Otherwise, show available targeting positions relative to the ship
            if (!updated) {
                const patternX = this.ship.x! + this.ship.pattern.integerCenter[0] - this.selectionPattern.integerCenter[0];
                const patternY = this.ship.y! + this.ship.pattern.integerCenter[1] - this.selectionPattern.integerCenter[1];
                game.board!.informationGenerator!.highlightPattern(patternX, patternY, this.selectionPattern);
            }

            game.board!.informationGenerator!.push();
            game.gameRenderer!.renderNext();

        }, () => {}, 'A');
        selectView('Ability');
    }

    /**
     * Removes view created for showing contextual information about this ability
     */
    public removeAbilityView(): void {
        super.removeAbilityView();
        removeView('Ability');
    }

    /**
     * Called when the ship that this ability is attached to rotates
     *
     * @param  rotation Amount the ship was rotated by
     */
    public onShipRotate(rotation: Rotation): void {
        this.selectionPattern = this.selectionPattern.rotated(rotation);
        this.effectPattern = this.effectPattern.rotated(rotation);
    }

    /**
     * Sends a request to use this ability
     *
     * @param  dx Horizontal distance from center of ship to fire upon
     * @param  dy Vertical distance from center of ship to fire upon
     */
    public use(dx: number, dy: number): void {
        if (!this._usable)
            return;
        sendRequest({
            request: 'useAbility',
            ship: this.ship.trackingID,
            ability: this.index,
            x: dx,
            y: dy
        });
    }
}
