import { v4 }                                                                     from 'uuid';
import { EventRegistrar }                                                         from '../events/event-registrar';
import { checkAgainstSchema }                                                     from '../schema-checker';
import { getJSONFromEntry, UnpackingError }                                       from '../unpacker';
import { buildAbility }                                                           from './abilities/ability-builder';
import { eventListenersFromActionSource }                                         from './actions/action-getter';
import { getAttributes }                                                          from './attributes/attribute-getter';
import { AttributeSpecial }                                                       from './attributes/attribute-special';
import { Descriptor }                                                             from './common/descriptor';
import { RotatablePattern }                                                       from './common/rotatable-pattern';
import { shipEventInfo }                                                          from './events/ship-events';
import { shipSchema }                                                             from './sources/ship';
import type { ParsingContext }                                                    from '../parsing-context';
import type { Ability }                                                           from './abilities/ability';
import type { AbilitySource }                                                     from './abilities/sources/ability';
import type { IAttributeHolder, ISpecialAttributeHolder, SpecialAttributeRecord } from './attributes/attribute-holder';
import type { AttributeMap }                                                      from './attributes/i-attribute-holder';
import type { Board }                                                             from './board';
import type { ShipEvent, ShipEventInfo }                                          from './events/ship-events';
import type { Player }                                                            from './player';
import type { IShipSource }                                                       from './sources/ship';
import type { Team }                                                              from './team';
import type { AbilityInfo }                                                       from 'shared/network/scenario/ability-info';
import type { IShipInfo, IShipPrototypeInfo }                                     from 'shared/network/scenario/i-ship-prototype-info';
import type { Rotation }                                                          from 'shared/scenario/objects/common/rotation';

/**
 * Ship - Server Version
 *
 * Movable object that exists on the board
 */
export class Ship implements IAttributeHolder, ISpecialAttributeHolder<'ship'> {

    protected _x = 0;
    protected _y = 0;

    protected spottedBy: Ship[] = [];
    protected spotting: Ship[] = [];
    protected knownTo: [team: Team, trackingID: string, newlyAppeared: boolean][] = [];

    /**
     * Ship constructor
     *
     * @param  owner             Owner of this ship
     * @param  board             Board that this ship belongs to
     * @param  descriptor        Descriptor for ship
     * @param  _pattern          Pattern describing shape of ship
     * @param  visibilityPattern Pattern describing cells from which this ship is visible
     * @param  abilities         Dictionary of abilities available to the ship
     * @param  eventRegistrar    Registrar of all ship event listeners
     * @param  attributes        Attributes for the ship
     * @param  specialAttributes Special attributes for the ship
     */
    public constructor(public readonly owner: Player,
                       public readonly board: Board,
                       public readonly descriptor: Descriptor,
                       protected _pattern: RotatablePattern,
                       protected visibilityPattern: RotatablePattern,
                       public readonly abilities: Ability[],
                       public readonly eventRegistrar: EventRegistrar<ShipEventInfo, ShipEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly specialAttributes: SpecialAttributeRecord<'ship'>) {
    }

    /**
     * Generates special attributes for Ship object
     *
     * @param    object Object to generate special attributes for
     * @returns         Record of special attributes for the object
     */
    private static generateSpecialAttributes(object: Ship): SpecialAttributeRecord<'ship'> {
        return {
            abilityCount: new AttributeSpecial(() => object.abilities.length)
        };
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

        // Ship partial refers to future ship object
        const shipPartial: Partial<Ship> = {};
        parsingContext.shipPartial = shipPartial;
        
        // Get attributes
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), shipSource.attributes, 'ship');
        const specialAttributes = Ship.generateSpecialAttributes(shipPartial as Ship);
        parsingContext.localAttributes.ship = [attributes, specialAttributes];
        parsingContext.reducePath();

        // Get component elements from source
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), shipSource.descriptor, false);
        parsingContext.reducePath();
        const pattern = await RotatablePattern.fromSource(parsingContext.withExtendedPath('.pattern'), shipSource.pattern, false);
        parsingContext.reducePath();

        // Create an extended pattern describing area from which this ship is visible
        const visibilityPattern = pattern.getExtendedPattern(shipSource.visibility);

        // Get abilities
        const abilities: Ability[] = [];
        const subRegistrars: EventRegistrar<ShipEventInfo, ShipEvent>[] = [];
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
            const ability = await buildAbility(parsingContext.withFile(`abilities/${abilityName}.json`), abilitySource, true);
            subRegistrars.push(ability.eventRegistrar);
            parsingContext.reduceFileStack();
            abilities.push(ability);
        }

        const eventListeners = await eventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), shipEventInfo, shipSource.actions);
        parsingContext.reducePath();

        // Return created Ship object
        parsingContext.localAttributes.ship = undefined;
        parsingContext.shipPartial = undefined;
        const eventRegistrar = new EventRegistrar(eventListeners, subRegistrars);
        Ship.call(shipPartial, parsingContext.playerPartial as Player, parsingContext.board!, descriptor, pattern, visibilityPattern, abilities, eventRegistrar, attributes, specialAttributes);
        (shipPartial as any).__proto__ = Ship.prototype;
        return shipPartial as Ship;
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @param    prototypeOnly Whether to export IShipPrototypeInfo or IShipInfo
     * @returns                Created IShipPrototype | IShipInfo object
     */
    public makeTransportable(prototypeOnly: false): IShipInfo;
    public makeTransportable(prototypeOnly: true): IShipPrototypeInfo;
    public makeTransportable(prototypeOnly: boolean): IShipPrototypeInfo | IShipInfo {
        const abilityInfo: AbilityInfo[] = [];
        for (const ability of this.abilities)
            abilityInfo.push(ability.makeTransportable());

        const prototypeInfo: IShipPrototypeInfo = {
            descriptor: this.descriptor.makeTransportable(),
            pattern: this._pattern.makeTransportable(false),
            visibilityPattern: this.visibilityPattern.makeTransportable(false),
            abilities: abilityInfo
        };

        if (prototypeOnly)
            return prototypeInfo;
        else
            return {
                ...prototypeInfo,
                owner: this.owner.client!.identity,
                x: this._x,
                y: this._y
            };
    }

    /**
     * Places this ship onto the board
     *
     * @param  x Destination X coordinate
     * @param  y Destination Y coordinate
     */
    public place(x: number, y: number): void {
        this._x = x;
        this._y = y;
        this.board.addShip(this);
    }

    /**
     * Sets initial spotting status of this ship
     */
    public spotInitial(): void {
        this.spot();
        this.updateKnown();
    }

    /**
     * Makes this ship visible to all other ships within its current visibility radius
     */
    private spot(): void {
        for (const [dx, dy] of this.visibilityPattern.patternEntries) {
            const tile = this.board.tiles[this._y + dy]?.[this._x + dx];
            const ship = tile?.[2];
            if (ship === undefined || ship.spotting.includes(this))
                continue;

            ship.spotting.push(this);
            this.spottedBy.push(ship);
        }
    }

    /**
     * Makes this ship invisible to all other ships within its current visibility radius
     */
    private unSpot(): void {
        const alreadyRemoved: Ship[] = [];
        for (const [dx, dy] of this.visibilityPattern.patternEntries) {
            const tile = this.board.tiles[this._y + dy]?.[this._x + dx];
            const ship = tile?.[2];
            if (ship === undefined || alreadyRemoved.includes(ship))
                continue;

            ship.spotting = ship.spotting.filter(s => s !== this);
            this.spottedBy = this.spottedBy.filter(s => s !== ship);
            alreadyRemoved.push(ship);
        }
    }

    /**
     * Updates the list of who knows about the location of this ship
     */
    private updateKnown(): void {

        // Create a dictionary of team IDs to existing ship tracking IDs
        const oldKnownEntries: { [id: string]: string } = {};
        for (const [team, trackingID] of this.knownTo) {
            oldKnownEntries[team.id] = trackingID;
        }

        // Create a new array of [team, trackingID, newlyAppeared] entries
        this.knownTo = [];
        const alreadyIncluded: Team[] = [];
        for (const ship of this.spottedBy) {
            const team = ship.owner.team;
            const previousEntry = oldKnownEntries[team.id];

            if (alreadyIncluded.includes(team))
                continue;

            let trackingID: string;
            const newlyAppeared = previousEntry === undefined;

            if (newlyAppeared) {
                trackingID = v4();
                team.broadcastEvent({
                    event: 'shipAppear',
                    trackingID: trackingID,
                    shipInfo: this.makeTransportable(false)
                });
            } else {
                trackingID = previousEntry;
            }

            this.knownTo.push([team, trackingID, newlyAppeared]);
            alreadyIncluded.push(team);
        }
    }

    /**
     * Moves the ship to a destination coordinate on the board
     *
     * @param  x Destination X coordinate
     * @param  y Destination Y coordinate
     */
    public moveTo(x: number, y: number): void {
        this.unSpot();
        this.board.removeShip(this);
        this._x = x;
        this._y = y;
        this.board.addShip(this);
        this.spot();
        this.updateKnown();

        // Broadcast movement to teams which know of this ship
        for (const [team, trackingID, newlyAppeared] of this.knownTo) {
            if (!newlyAppeared)
                team.broadcastEvent({
                    event: 'shipMove',
                    trackingID: trackingID,
                    x: this._x,
                    y: this._y
                });
        }
    }

    /**
     * Moves the ship by an offset
     *
     * @param  dx Horizontal distance to move ship by
     * @param  dy Vertical distance to move ship by
     */
    public moveBy(dx: number, dy: number): void {
        this.moveTo(this._x + dx, this._y + dy);
    }

    /**
     * Rotates the ship in place
     *
     * @param  rotation Amount to rotate ship by
     */
    public rotate(rotation: Rotation): void {
        this.unSpot();
        this.board.removeShip(this);
        this._pattern = this._pattern.rotated(rotation);
        this.visibilityPattern = this.visibilityPattern.rotated(rotation);
        this.board.addShip(this);
        this.spot();
        this.updateKnown();

        // Broadcast rotation to teams which know of this ship
        for (const [team, trackingID, newlyAppeared] of this.knownTo) {
            if (!newlyAppeared)
                team.broadcastEvent({
                    event: 'shipRotate',
                    trackingID: trackingID,
                    rotation: rotation
                });
        }
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

    public get pattern(): RotatablePattern {
        return this._pattern;
    }
}
