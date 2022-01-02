import { game }                  from '../../game';
import { sendRequest }           from '../../sockets/opener';
import { AttributeCollection }   from '../attribute-collection';
import { Board }                 from '../board';
import { Descriptor }            from '../descriptor';
import { Pattern }               from '../pattern';
import { TileType }              from '../tiletype';
import { Ability }               from './ability';
import type { ColorAtlas }       from '../../ui/canvas/color-atlas';
import type { Tile }             from '../board';
import type { Ship }             from '../ship';
import type { IAbilityMoveInfo } from 'shared/network/scenario/ability-info';

/**
 * AbilityMove - Client Version
 *
 * Ability which moves a ship upon its use
 */
export class AbilityMove extends Ability {

    protected readonly abilityClass = 'ability-move';

    public static readonly moveValidTileType = new TileType({
        name: 'Valid Move',
        description: 'This ship is allowed to move here'
    }, '', false);
    public static readonly moveOriginTileType = new TileType({
        name: 'Current Position',
        description: ''
    }, '', false);

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
                       public readonly pattern: Pattern,
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
        const pattern = Pattern.fromInfo(abilityMoveInfo.pattern);
        const attributeCollection = new AttributeCollection(abilityMoveInfo.attributes);
        return new AbilityMove(ship, index, descriptor, abilityMoveInfo.icon, pattern, attributeCollection, abilityMoveInfo.usable);
    }

    /**
     * Generates a board representing possible actions for this ability
     *
     * @param    colorAtlas Color atlas to use for tile colors
     * @returns             Board representing moves available
     */
    public generateAbilityBoard(colorAtlas: ColorAtlas<'moveValid' | 'moveOrigin'>): Board {
        const tiles: Tile[][] = [];
        const [patternBoundX, patternBoundY] = this.pattern.getBounds();

        const boardSize = Math.max(patternBoundX, patternBoundY) + 3;
        const offsetX = Math.floor((boardSize - patternBoundX - 1) / 2);
        const offsetY = Math.floor((boardSize - patternBoundY - 1) / 2);

        AbilityMove.moveValidTileType.colorPaletteIndex = colorAtlas.specialColorIndices.moveValid;
        AbilityMove.moveOriginTileType.colorPaletteIndex = colorAtlas.specialColorIndices.moveOrigin;

        for (let y = 0; y < boardSize; y++) {
            tiles[y] = [];
            for (let x = 0; x < boardSize; x++) {
                const patternX = x - offsetX;
                const patternY = y - offsetY;

                const dx = patternX - this.pattern.center[0];
                const dy = patternY - this.pattern.center[1];

                if (dx === 0 && dy === 0)
                    tiles[y][x] = [AbilityMove.moveOriginTileType, [], undefined, undefined];
                else if (this.pattern.query(patternX, patternY))
                    tiles[y][x] = [AbilityMove.moveValidTileType, [], undefined, () => this.use(dx, dy)];
                else
                    tiles[y][x] = [game.board!.primaryTileType, [], undefined, undefined];
            }
        }

        return new Board(tiles, [AbilityMove.moveOriginTileType, AbilityMove.moveValidTileType], game.board!.primaryTileType);
    }

    /**
     * Sends a request to use this ability
     *
     * @param  dx Horizontal distance to move
     * @param  dy Vertical distance to move
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
