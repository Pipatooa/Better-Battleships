import { selfPlayer }                     from '../../player';
import { sendRequest }                    from '../../sockets/opener';
import { SidebarElements }                from '../../ui/element-cache';
import { Message }                        from '../../ui/message';
import { currentPlayerTurn }              from '../../ui/updaters/turn-indicator-updater';
import { AttributeCollection }            from '../attribute-collection';
import { Descriptor }                     from '../descriptor';
import { TileType }                       from '../tiletype';
import { Ability }                        from './ability';
import type { Ship }                      from '../ship';
import type { IAbilityGenericInfo }       from 'shared/network/scenario/ability-info';
import type { IAbilityMoveUsabilityInfo } from 'shared/network/scenario/ability-usability-info';

/**
 * AbilityGeneric - Client Version
 *
 * Ability which moves a ship upon its use
 */
export class AbilityGeneric extends Ability {

    // Unknown, Invalid, Valid tile types for move board representation
    private static readonly moveTileTypes = [
        new TileType(new Descriptor('Unknown Move', "This ship might be able to move here. We don't know enough information"), '', false),
        new TileType(new Descriptor('Invalid Move', "This ship can't move here. Something is blocking its path"), '', false),
        new TileType(new Descriptor('Valid Move', 'This ship can move here'), '', false)
    ] as const;

    // Other tile types for board representation
    private static readonly originTileType = new TileType(new Descriptor('Current Position', ''), '', false);

    /**
     * AbilityGeneric constructor
     *
     * @param  ship                Ship that this ability belongs to
     * @param  index               Index of this ability in ship's ability list
     * @param  descriptor          Descriptor for ability
     * @param  icon                Url to icon for this ability
     * @param  attributeCollection Attributes for this ability
     * @param  buttonText          Text which appears on the button to use the ability
     * @param  usable              Whether this ability is usable
     */
    public constructor(ship: Ship,
                       index: number,
                       descriptor: Descriptor,
                       icon: string,
                       attributeCollection: AttributeCollection,
                       private readonly buttonText: string,
                       usable: boolean) {
        super(ship, index, descriptor, icon, attributeCollection, usable);
    }

    /**
     * Factory function to generate AbilityGeneric from transportable JSON
     *
     * @param    abilityGenericInfo JSON data for AbilityGeneric
     * @param    ship               Ship that this ability belongs to
     * @param    index              Index of this ability in ship's ability list
     * @returns                     Created AbilityGeneric object
     */
    public static fromInfo(abilityGenericInfo: IAbilityGenericInfo, ship: Ship, index: number): AbilityGeneric {
        const descriptor = Descriptor.fromInfo(abilityGenericInfo.descriptor);
        const attributeCollection = new AttributeCollection(abilityGenericInfo.attributes);
        return new AbilityGeneric(ship, index, descriptor, abilityGenericInfo.icon, attributeCollection, abilityGenericInfo.buttonText, abilityGenericInfo.usability.usable);
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
        this.boardChangedCallback?.();
    }

    /**
     * Generates a board representing possible actions for this ability
     *
     * @returns  Board representing moves available
     */
    public generateAbilityBoard(): undefined {
        return undefined;
    }

    /**
     * Called when the ship that this ability is attached to rotates
     */
    public onShipRotate(): void {}

    /**
     * Creates a view for showing contextual information about this ability
     */
    public createAbilityView(): void {
        SidebarElements.shipAbilityUseButton.element.text(this.buttonText);
        SidebarElements.shipAbilityUseButton.setVisibility(true);
    }

    /**
     * Removes view created for showing contextual information about this ability
     */
    public removeAbilityView(): void {
        SidebarElements.shipAbilityUseButton.setVisibility(false);
    }

    /**
     * Sends a request to use this ability
     */
    public use(): void {
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
            index: 0
        });
    }
}
