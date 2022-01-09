import { SubAbilityUsability, subAbilityUsabilityIndexOffset } from 'shared/network/scenario/ability-usability-info';
import { game }                                                from '../../game';
import { selfPlayer }                                          from '../../player';
import { sendRequest }                                         from '../../sockets/opener';
import { UIManager }                                           from '../../ui/managers/ui-manager';
import {
    createView,
    removeView,
    selectView,
    updateViewIfActive
}                                                              from '../../ui/managers/view-manager';
import { Message }                        from '../../ui/message';
import { currentPlayerTurn }              from '../../ui/updaters/turn-updater';
import { AttributeCollection }            from '../attribute-collection';
import { Board }                          from '../board';
import { Descriptor }                     from '../descriptor';
import { RotatablePattern }               from '../rotatable-pattern';
import { TileType }                       from '../tiletype';
import { Ability }                        from './ability';
import type { ColorAtlas }                from '../../ui/canvas/color-atlas';
import type { Tile }                      from '../board';
import type { Ship }                      from '../ship';
import type { IAbilityMoveInfo }          from 'shared/network/scenario/ability-info';
import type { IAbilityMoveUsabilityInfo } from 'shared/network/scenario/ability-usability-info';
import type { Rotation }                  from 'shared/scenario/rotation';

/**
 * AbilityMove - Client Version
 *
 * Ability which moves a ship upon its use
 */
export class AbilityMove extends Ability {

    // Unknown, Invalid, Valid tile types for move board representation
    private static readonly moveTileTypes = [
        new TileType(new Descriptor('Unknown Move', "This ship might be able to move here. We don't know enough information"), '', false),
        new TileType(new Descriptor('Invalid Move', "This ship can't move here. Something is blocking its path"), '', false),
        new TileType(new Descriptor('Valid Move', 'This ship can move here'), '', false)
    ] as const;

    // Other tile types for board representation
    private static readonly originTileType = new TileType(new Descriptor('Current Position', ''), '', false);

    /**
     * AbilityMove constructor
     *
     * @param  ship                Ship that this ability belongs to
     * @param  index               Index of this ability in ship's ability list
     * @param  descriptor          Descriptor for ability
     * @param  icon                Url to icon for this ability
     * @param  pattern             Pattern describing possible movements
     * @param  attributeCollection Attributes for this ability
     * @param  usable              Whether this ability is usable
     */
    public constructor(ship: Ship,
                       index: number,
                       descriptor: Descriptor,
                       icon: string,
                       private pattern: RotatablePattern,
                       attributeCollection: AttributeCollection,
                       usable: boolean) {
        super(ship, index, descriptor, icon, attributeCollection, usable);
    }

    /**
     * Factory function to generate AbilityMove from transportable JSON
     *
     * @param    abilityMoveInfo JSON data for AbilityMove
     * @param    ship            Ship that this ability belongs to
     * @param    index           Index of this ability in ship's ability list
     * @returns                  Created AbilityMove object
     */
    public static fromInfo(abilityMoveInfo: IAbilityMoveInfo, ship: Ship, index: number): AbilityMove {
        const descriptor = Descriptor.fromInfo(abilityMoveInfo.descriptor);
        const pattern = RotatablePattern.fromInfo(abilityMoveInfo.usability.pattern);
        const attributeCollection = new AttributeCollection(abilityMoveInfo.attributes);
        return new AbilityMove(ship, index, descriptor, abilityMoveInfo.icon, pattern, attributeCollection, abilityMoveInfo.usability.usable);
    }

    /**
     * Updates this ability's usability from update data sent by the server
     *
     * @param  usabilityUpdate Ability usability update object
     */
    public updateUsability(usabilityUpdate: boolean | IAbilityMoveUsabilityInfo): void {
        if (usabilityUpdate === true || usabilityUpdate === false) {
            this.usable = usabilityUpdate;
            return;
        }

        this.usable = usabilityUpdate.usable;
        this.pattern = RotatablePattern.fromInfo(usabilityUpdate.pattern);
        this.boardChangedCallback?.();
    }

    /**
     * Generates a board representing possible actions for this ability
     *
     * @param    colorAtlas Color atlas to use for tile colors
     * @returns             Board representing moves available
     */
    public generateAbilityBoard(colorAtlas: ColorAtlas): Board {
        const tiles: Tile[][] = [];
        const [xMin, xMax, yMin, yMax] = this.pattern.bounds;

        const boardSize = Math.max(xMax - xMin, yMax - yMin, 2) + 3;
        const offsetX = Math.floor((boardSize + xMin - xMax - 1) / 2);
        const offsetY = Math.floor((boardSize + yMin - yMax - 1) / 2);

        // Set tile colors using color atlas
        AbilityMove.moveTileTypes[0].colorPaletteIndex = colorAtlas.specialColorIndices.unknown;
        AbilityMove.moveTileTypes[1].colorPaletteIndex = colorAtlas.specialColorIndices.invalid;
        AbilityMove.moveTileTypes[2].colorPaletteIndex = colorAtlas.specialColorIndices.valid;
        AbilityMove.originTileType.colorPaletteIndex = colorAtlas.specialColorIndices.origin;

        const hoverCallback = (): void => updateViewIfActive('Ability');

        // Convert pattern values into board tiles
        for (let y = 0; y < boardSize; y++) {
            tiles[y] = [];
            for (let x = 0; x < boardSize; x++) {
                const patternX = x - offsetX;
                const patternY = y - offsetY;

                const dx = patternX - this.pattern.center[0];
                const dy = patternY - this.pattern.center[1];

                // Origin
                if (dx === 0 && dy === 0) {
                    tiles[y][x] = [AbilityMove.originTileType, [], undefined, hoverCallback, undefined];
                    continue;
                }

                // Normal tile
                const patternValue = this.pattern.query(patternX, patternY);
                if (patternValue === SubAbilityUsability.NotUsable)
                    tiles[y][x] = [game.board!.primaryTileType, [], undefined, hoverCallback, undefined];

                // Tile representing move
                else {
                    const tileType = AbilityMove.moveTileTypes[patternValue + subAbilityUsabilityIndexOffset];
                    const clickCallback = patternValue === SubAbilityUsability.Valid ? () => this.use(dx, dy) : undefined;
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

            // Show a preview for the new location of the ship using the selection renderer if hovering over ability board move location
            let updated = false;
            if (UIManager.currentManager!.hoveredAbilityLocation !== undefined) {
                const x = UIManager.currentManager!.hoveredAbilityLocation[0] - 1;
                const y = UIManager.currentManager!.hoveredAbilityLocation[1] - 1;
                const patternValue = this.pattern.query(x, y);

                // Only show if tile hovered on ability board is an available move
                if (patternValue !== SubAbilityUsability.NotUsable) {
                    updated = true;
                    const dx = x - this.pattern.integerCenter[0];
                    const dy = y - this.pattern.integerCenter[1];
                    const patternX = this.ship.x! + this.ship.pattern.center[0] + dx;
                    const patternY = this.ship.y! + this.ship.pattern.center[1] + dy;
                    UIManager.currentManager!.updateMainCanvasSelectionLocation = false;
                    game.gameRenderer!.selectionInfoGenerator.setSelectionShip(this.ship);
                    game.gameRenderer!.selectionInfoGenerator.setOffset(patternX, patternY);
                }
            }

            // Otherwise, show default selection pattern
            if (!updated) {
                UIManager.currentManager!.updateMainCanvasSelectionLocation = true;
                game.gameRenderer!.selectionInfoGenerator.setSelectionPattern();
            }

            game.gameRenderer!.selectionInfoGenerator.push();
            game.gameRenderer!.renderNext();

        }, () => {
            UIManager.currentManager!.updateMainCanvasSelectionLocation = true;
            game.gameRenderer!.selectionInfoGenerator.setSelectionPattern();
            game.gameRenderer!.selectionInfoGenerator.push();
            game.gameRenderer!.renderNext();
        }, 'A');
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
        this.pattern = this.pattern.rotated(rotation);
        this.boardChangedCallback?.();
    }

    /**
     * Sends a request to use this ability
     *
     * @param  dx Horizontal distance to move
     * @param  dy Vertical distance to move
     */
    public use(dx: number, dy: number): void {
        if (this.ship.player !== selfPlayer)
            return;
        if (!this._usable) {
            new Message('Cannot use this ability at the moment.');
            return;
        }
        if (currentPlayerTurn !== selfPlayer) {
            new Message("Cannot use this ability. It's not your turn.");
            return;
        }
        sendRequest({
            request: 'useAbility',
            ship: this.ship.trackingID,
            ability: this.index,
            x: dx,
            y: dy
        });
    }
}
