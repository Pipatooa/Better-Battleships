import type { AbilityInfo } from '../../../../shared/network/scenario/ability-info';
import type { IShipInfo } from '../../../../shared/network/scenario/i-ship-info';
import type { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { getJSONFromEntry, UnpackingError } from '../unpacker';
import type { Ability } from './abilities/ability';
import { buildAbility } from './abilities/ability-builder';
import type { AbilitySource } from './abilities/sources/ability';
import { getAttributes } from './attributes/attribute-getter';
import type { AttributeMap } from './attributes/i-attribute-holder';
import type { IAttributeHolder } from './attributes/sources/attribute-holder';
import { Descriptor } from './common/descriptor';
import { Pattern } from './common/pattern';
import type { Rotation } from './common/rotation';
import type { IShipSource } from './sources/ship';
import { shipSchema } from './sources/ship';

/**
 * Ship - Server Version
 *
 * Movable object that exists on the board
 */
export class Ship implements IAttributeHolder {

    protected _x = 0;
    protected _y = 0;

    /**
     * Ship constructor
     *
     * @param  descriptor Descriptor for ship
     * @param  _pattern   Pattern describing shape of ship
     * @param  abilities  Dictionary of abilities available to the ship
     * @param  attributes Attributes for the ship
     */
    public constructor(public readonly descriptor: Descriptor,
                       protected _pattern: Pattern,
                       public readonly abilities: Ability[],
                       public readonly attributes: AttributeMap) {
    }

    /**
     * Moves the ship to a destination coordinate on the board
     *
     * @param  x Destination x coordinate
     * @param  y Destination y coordinate
     */
    public moveTo(x: number, y: number): void {
        this._x = x;
        this._y = y;
    }

    /**
     * Moves the ship by an offset
     *
     * @param  x Horizontal distance to move ship by
     * @param  y Vertical distance to move ship by
     */
    public moveBy(x: number, y: number): void {
        this._x += x;
        this._y += y;
    }

    /**
     * Rotates the ship in place
     *
     * @param  rotation Amount to rotate ship by
     */
    public rotate(rotation: Rotation): void {
        this._pattern = this._pattern.rotated(rotation);
    }

    /**
     * Returns a list of the coordinates of every cell that this ship occupies.
     *
     * @param    offset Optional offset to apply to cell coordinates
     * @returns         List of coordinates of every cell that this ship occupies
     */
    public getCells(offset: [number, number] = [ 0, 0 ]): [number, number][] {
        const cells: [number, number][] = [];

        // Iterate through entries in pattern
        for (const [x, y] of this._pattern.patternEntries) {

            // Offset pattern entries by the position of the ship and offset provided
            const shipX: number = x + this.x + offset[0];
            const shipY: number = y + this.y + offset[1];

            // Add cell coordinate to list of cells
            cells.push([shipX, shipY]);
        }

        // Return list of cell coordinates
        return cells;
    }

    /**
     * Factory function to generate Ship from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    shipSource     JSON data for Ship
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Ship object
     */
    public static async fromSource(parsingContext: ParsingContext, shipSource: IShipSource, checkSchema: boolean): Promise<Ship> {

        // Validate JSON data against schema
        if (checkSchema)
            shipSource = await checkAgainstSchema(shipSource, shipSchema, parsingContext);

        // Get attributes and update parsing context
        // Ship partial refers to future ship object
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), shipSource.attributes, 'ship');
        const shipPartial: Partial<Ship> = {};
        parsingContext = parsingContext.withShipAttributes(attributes).withShipReference(shipPartial);

        // Get component elements from source
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), shipSource.descriptor, false);
        const pattern = await Pattern.fromSource(parsingContext.withExtendedPath('.pattern'), shipSource.pattern, false);

        // Get abilities
        const abilities: Ability[] = [];
        for (let i = 0; i < shipSource.abilities.length; i++) {
            const abilityName = shipSource.abilities[i];

            // If ship does not exist
            if (!(abilityName in parsingContext.abilityEntries))
                throw new UnpackingError(`Could not find 'abilities/${abilityName}.json'`, parsingContext);

            // If ability already exists
            if (abilityName in abilities)
                throw new UnpackingError(`Ship cannot define the same ability twice '${abilityName}' at '${parsingContext.currentPath}.abilities[${i}]'`, parsingContext);

            // Unpack ability data
            const abilitySource: AbilitySource = await getJSONFromEntry(parsingContext.abilityEntries[abilityName]) as unknown as AbilitySource;
            const ability = await buildAbility(parsingContext.withUpdatedFile(`abilities/${abilityName}.json`), abilitySource, true);
            abilities.push(ability);
        }

        // Return created Ship object
        Ship.call(shipPartial, descriptor, pattern, abilities, attributes);
        (shipPartial as any).__proto__ = Ship.prototype;
        return shipPartial as Ship;
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created IShipInfo object
     */
    public makeTransportable(): IShipInfo {
        const abilityInfo: AbilityInfo[] = [];
        for (const ability of this.abilities)
            abilityInfo.push(ability.makeTransportable());

        return {
            descriptor: this.descriptor.makeTransportable(),
            pattern: this._pattern.makeTransportable(false),
            abilities: abilityInfo
        };
    }

    /**
     * Getters and setters
     */
    
    public get x(): number {
        return this._x;
    }
    
    public get y(): number {
        return this._y;
    }
}
