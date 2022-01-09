import { game }                                                   from 'client/game/game';
import { SubAbilityUsability, subAbilityUsabilityIndexOffset }    from 'shared/network/scenario/ability-usability-info';
import { rotatePoint, Rotation }                                  from 'shared/scenario/rotation';
import { selfPlayer }                                             from '../../player';
import { sendRequest }                                            from '../../sockets/opener';
import { UIManager }                                              from '../../ui/managers/ui-manager';
import { createView, removeView, selectView, updateViewIfActive } from '../../ui/managers/view-manager';
import { Message }                                                from '../../ui/message';
import { currentPlayerTurn }                                      from '../../ui/updaters/turn-updater';
import { AttributeCollection }                                    from '../attribute-collection';
import { Board }                                                  from '../board';
import { Descriptor }                                             from '../descriptor';
import { TileType }                                               from '../tiletype';
import { Ability }                                                from './ability';
import type { ColorAtlas }                                        from '../../ui/canvas/color-atlas';
import type { Tile }                                              from '../board';
import type { Ship }                                              from '../ship';
import type { IAbilityRotateInfo }                                from 'shared/network/scenario/ability-info';
import type { IAbilityRotateUsabilityInfo }                       from 'shared/network/scenario/ability-usability-info';


/**
 * AbilityFire - Client Version
 *
 * Ability which rotates a ship upon its use
 */
export class AbilityRotate extends Ability {

    // Unknown, Invalid, Valid tile types for clockwise board representation
    private static readonly rot90tileTypes = [
        new TileType(new Descriptor('Rotate Clockwise', "This ship might be able to rotate clockwise. We don't know enough information"), '', false),
        new TileType(new Descriptor('Rotate Clockwise', "This ship can't rotate clockwise. Something is blocking its path"), '', false),
        new TileType(new Descriptor('Rotate Clockwise', 'This ship can rotate clockwise'), '', false)
    ] as const;

    // Unknown, Invalid, Valid tile types for half turn board representation
    private static readonly rot180tileTypes = [
        new TileType(new Descriptor('Rotate 180 Degrees', "This ship might be able to rotate 180 degrees. We don't know enough information"), '', false),
        new TileType(new Descriptor('Rotate 180 Degrees', "This ship can't rotate 180 degrees. Something is blocking its path"), '', false),
        new TileType(new Descriptor('Rotate 180 Degrees', 'This ship can rotate 180 degrees'), '', false)
    ] as const;

    // Unknown, Invalid, Valid tile types for anticlockwise board representation
    private static readonly rot270tileTypes = [
        new TileType(new Descriptor('Rotate Anticlockwise', "This ship might be able to rotate anticlockwise. We don't know enough information"), '', false),
        new TileType(new Descriptor('Rotate Anticlockwise', "This ship can't rotate anticlockwise. Something is blocking its path"), '', false),
        new TileType(new Descriptor('Rotate Anticlockwise', 'This ship can rotate anticlockwise'), '', false)
    ] as const;

    // Other tile types for board representation
    private static readonly originTileType = new TileType(new Descriptor('Current Position', ''), '', false);
    private static readonly headingTileType = new TileType(new Descriptor('Current Heading', 'Direction that the ship is heading'), '', false);

    // Where rotations are represented on the ability board
    private headingLocation: [number, number] = [2, 1];
    private rot90location: [number, number] = [3, 2];
    private rot180location: [number, number] = [2, 3];
    private rot270location: [number, number] = [1, 2];

    /**
     * AbilityFire constructor
     *
     * @param  ship                Ship that this ability belongs to
     * @param  index               Index of this ability in ship's ability list
     * @param  descriptor          Descriptor for ability
     * @param  icon                Url to icon for this ability
     * @param  rot90valid          Whether a rotation by 90 degrees is allowed and whether it can be performed
     * @param  rot180valid         Whether a rotation by 180 degrees is allowed and whether it can be performed
     * @param  rot270valid         Whether a rotation by 270 degrees is allowed and whether it can be performed
     * @param  attributeCollection Attributes for this ability
     * @param  usable              Whether this ability is usable
     */
    public constructor(ship: Ship,
                       index: number,
                       descriptor: Descriptor,
                       icon: string,
                       private rot90valid: SubAbilityUsability,
                       private rot180valid: SubAbilityUsability,
                       private rot270valid: SubAbilityUsability,
                       attributeCollection: AttributeCollection,
                       usable: boolean) {
        super(ship, index, descriptor, icon, attributeCollection, usable);
    }

    /**
     * Factory function to generate AbilityRotate from transportable JSON
     *
     * @param    abilityRotateInfo JSON data for AbilityRotate
     * @param    ship              Ship that this ability belongs to
     * @param    index             Index of this ability in ship's ability list
     * @returns                    Created AbilityRotate object
     */
    public static fromInfo(abilityRotateInfo: IAbilityRotateInfo, ship: Ship, index: number): AbilityRotate {
        const descriptor = Descriptor.fromInfo(abilityRotateInfo.descriptor);
        const attributeCollection = new AttributeCollection(abilityRotateInfo.attributes);
        const [rot90valid, rot180valid, rot270valid] = abilityRotateInfo.usability.rotations;
        return new AbilityRotate(ship, index, descriptor, abilityRotateInfo.icon, rot90valid, rot180valid, rot270valid, attributeCollection, abilityRotateInfo.usability.usable);
    }

    /**
     * Updates this ability's usability from update data sent by the server
     *
     * @param  usabilityUpdate Ability usability update object
     */
    public updateUsability(usabilityUpdate: boolean | IAbilityRotateUsabilityInfo): void {
        if (usabilityUpdate === true || usabilityUpdate === false) {
            this.usable = usabilityUpdate;
            return;
        }
        
        this.usable = usabilityUpdate.usable;
        [this.rot90valid, this.rot180valid, this.rot270valid] = usabilityUpdate.rotations;
        this.boardChangedCallback?.();
    }

    /**
     * Generates a board representing possible actions for this ability
     *
     * @param    colorAtlas Color atlas to use for tile colors
     * @returns             Board representing rotations available
     */
    public generateAbilityBoard(colorAtlas: ColorAtlas): Board {
        const tiles: Tile[][] = [];

        // Update tile colors using color atlas
        AbilityRotate.rot90tileTypes[0].colorPaletteIndex = colorAtlas.specialColorIndices.unknown;
        AbilityRotate.rot90tileTypes[1].colorPaletteIndex = colorAtlas.specialColorIndices.invalid;
        AbilityRotate.rot90tileTypes[2].colorPaletteIndex = colorAtlas.specialColorIndices.valid;
        AbilityRotate.rot180tileTypes[0].colorPaletteIndex = colorAtlas.specialColorIndices.unknown;
        AbilityRotate.rot180tileTypes[1].colorPaletteIndex = colorAtlas.specialColorIndices.invalid;
        AbilityRotate.rot180tileTypes[2].colorPaletteIndex = colorAtlas.specialColorIndices.valid;
        AbilityRotate.rot270tileTypes[0].colorPaletteIndex = colorAtlas.specialColorIndices.unknown;
        AbilityRotate.rot270tileTypes[1].colorPaletteIndex = colorAtlas.specialColorIndices.invalid;
        AbilityRotate.rot270tileTypes[2].colorPaletteIndex = colorAtlas.specialColorIndices.valid;
        AbilityRotate.originTileType.colorPaletteIndex = colorAtlas.specialColorIndices.origin;
        AbilityRotate.headingTileType.colorPaletteIndex = colorAtlas.specialColorIndices.heading;

        const hoverCallback = (): void => updateViewIfActive('Ability');

        // Populate 5x5 with primary game tile
        for (let y = 0; y < 5; y++) {
            tiles[y] = [];
            for (let x = 0; x < 5; x++) {
                if (x === 2 && y === 2)
                    tiles[y][x] = [AbilityRotate.originTileType, [], undefined, hoverCallback, undefined];
                else
                    tiles[y][x] = [game.board!.primaryTileType, [], undefined, hoverCallback, undefined];
            }
        }

        // Replace tiles with rotation tiles where necessary
        if (this.rot90valid !== SubAbilityUsability.NotUsable) {
            const tileType = AbilityRotate.rot90tileTypes[this.rot90valid + subAbilityUsabilityIndexOffset];
            const [x, y] = this.rot90location;
            const clickCallback = this.rot90valid === SubAbilityUsability.Valid ? () => this.use(Rotation.Clockwise90) : undefined;
            tiles[y][x] = [tileType, [], undefined, hoverCallback, clickCallback];
        }
        if (this.rot180valid !== SubAbilityUsability.NotUsable) {
            const tileType = AbilityRotate.rot180tileTypes[this.rot180valid + subAbilityUsabilityIndexOffset];
            const [x, y] = this.rot180location;
            const clickCallback = this.rot180valid === SubAbilityUsability.Valid ? () => this.use(Rotation.Clockwise180) : undefined;
            tiles[y][x] = [tileType, [], undefined, hoverCallback, clickCallback];
        }
        if (this.rot270valid !== SubAbilityUsability.NotUsable) {
            const tileType = AbilityRotate.rot270tileTypes[this.rot270valid + subAbilityUsabilityIndexOffset];
            const [x, y] = this.rot270location;
            const clickCallback = this.rot270valid === SubAbilityUsability.Valid ? () => this.use(Rotation.Clockwise270) : undefined;
            tiles[y][x] = [tileType, [], undefined, hoverCallback, clickCallback];
        }

        // Place heading tile
        const [x, y] = this.headingLocation;
        tiles[y][x] = [AbilityRotate.headingTileType, [], undefined];

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

            // Show a preview for the new location of the ship using the selection renderer if hovering over ability board rotation location
            let updated = false;
            if (UIManager.currentManager!.hoveredAbilityLocation !== undefined) {
                const x = UIManager.currentManager!.hoveredAbilityLocation[0];
                const y = UIManager.currentManager!.hoveredAbilityLocation[1];

                // Check if hovering over a rotation which is available
                let rotation: Rotation | undefined;
                if (this.rot90location[0] === x && this.rot90location[1] === y && this.rot90valid !== SubAbilityUsability.NotUsable)
                    rotation = Rotation.Clockwise90;
                else if (this.rot180location[0] === x && this.rot180location[1] === y && this.rot180valid !== SubAbilityUsability.NotUsable)
                    rotation = Rotation.Clockwise180;
                else if (this.rot270location[0] === x && this.rot270location[1] === y && this.rot270valid !== SubAbilityUsability.NotUsable)
                    rotation = Rotation.Clockwise270;

                // Only show if tile hovered on ability board is an available rotation
                if (rotation !== undefined) {
                    updated = true;
                    const [rotatedShipCenterX, rotatedShipCenterY] = rotatePoint(this.ship.pattern.center, this.ship.pattern.rotationalCenter, rotation);
                    const patternX = this.ship.x! + rotatedShipCenterX;
                    const patternY = this.ship.y! + rotatedShipCenterY;
                    UIManager.currentManager!.updateMainCanvasSelectionLocation = false;
                    game.gameRenderer!.selectionInfoGenerator.setSelectionShip(this.ship, rotation);
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
        this.headingLocation = rotatePoint(this.headingLocation, [2, 2], rotation);
        this.rot90location = rotatePoint(this.rot90location, [2, 2], rotation);
        this.rot180location = rotatePoint(this.rot180location, [2, 2], rotation);
        this.rot270location = rotatePoint(this.rot270location, [2, 2], rotation);
        this.boardChangedCallback?.();
    }

    /**
     * Sends a request to use this ability
     *
     * @param  rotation Rotation to apply to ship
     */
    public use(rotation: Rotation): void {
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
            index: rotation
        });
    }
}
