import { v4 }                                                                     from 'uuid';
import { EventRegistrar }                                                         from '../events/event-registrar';
import { checkAgainstSchema }                                                     from '../schema-checker';
import { getJSONFromEntry, UnpackingError }                                       from '../unpacker';
import { buildAbility }                                                           from './abilities/ability-builder';
import { eventListenersFromActionSource }                                         from './actions/action-getter';
import { getAttributeListeners }                                                  from './attribute-listeners/attribute-listener-getter';
import { AttributeCodeControlled }                                                from './attributes/attribute-code-controlled';
import { getAttributes }                                                          from './attributes/attribute-getter';
import { Descriptor }                                                             from './common/descriptor';
import { RotatablePattern }                                                       from './common/rotatable-pattern';
import { shipEventInfo }                                                          from './events/ship-events';
import { shipSchema }                                                             from './sources/ship';
import type { ParsingContext }                                                    from '../parsing-context';
import type { Ability }                                                           from './abilities/ability';
import type { AbilitySource }                                                     from './abilities/sources/ability';
import type { AttributeListener }                                                 from './attribute-listeners/attribute-listener';
import type { BuiltinAttributeRecord, IAttributeHolder, IBuiltinAttributeHolder } from './attributes/attribute-holder';
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
export class Ship implements IAttributeHolder, IBuiltinAttributeHolder<'ship'> {

    protected _x = 0;
    protected _y = 0;

    public readonly teamTrackingID: string = v4();

    protected spottedBy: Ship[] = [];
    protected needsSpottingUpdate: Ship[] = [];
    protected knownTo: [team: Team, trackingID: string, newlyAppeared: boolean][] = [];
    
    /**
     * Ship constructor
     *
     * @param  owner              Owner of this ship
     * @param  board              Board that this ship belongs to
     * @param  descriptor         Descriptor for ship
     * @param  _pattern           Pattern describing shape of ship
     * @param  _visibilityPattern Pattern describing cells from which this ship is visible
     * @param  abilities          Dictionary of abilities available to the ship
     * @param  eventRegistrar     Registrar of all ship event listeners
     * @param  attributes         Attributes for the ship
     * @param  builtinAttributes  Built-in attributes for the ship
     * @param  attributeListeners Attribute listeners for the ship
     */
    public constructor(public readonly owner: Player,
                       public readonly board: Board,
                       public readonly descriptor: Descriptor,
                       protected _pattern: RotatablePattern,
                       protected _visibilityPattern: RotatablePattern,
                       public readonly abilities: Ability[],
                       public readonly eventRegistrar: EventRegistrar<ShipEventInfo, ShipEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly builtinAttributes: BuiltinAttributeRecord<'ship'>,
                       private readonly attributeListeners: AttributeListener[]) {
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        for (const attributeListener of this.attributeListeners)
            attributeListener.unregister();
        for (const ability of this.abilities)
            ability.deconstruct();
        this.eventRegistrar.detach();

        for (const [team, trackingID] of this.knownTo) {
            team.broadcastEvent({
                event: 'shipDestroyed',
                trackingID: trackingID
            });
        }

        this.unSpotOthers();
        this.updateOthers();
        this.board.removeShip(this);
    }

    /**
     * Generates built-in attributes for Ship object
     *
     * @param    object Object to generate built-in attributes for
     * @returns         Record of built-in attributes for the object
     */
    private static generateBuiltinAttributes(object: Ship): BuiltinAttributeRecord<'ship'> {
        return {
            abilityCount: new AttributeCodeControlled(() => object.abilities.length)
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
        const shipPartial: Partial<Ship> = Object.create(Ship.prototype);
        parsingContext.shipPartial = shipPartial;
        
        // Get attributes
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), shipSource.attributes, 'ship');
        const builtinAttributes = Ship.generateBuiltinAttributes(shipPartial as Ship);
        parsingContext.localAttributes.ship = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), shipSource.attributeListeners);
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
        Ship.call(shipPartial, parsingContext.playerPartial as Player, parsingContext.board!, descriptor, pattern, visibilityPattern, abilities, eventRegistrar, attributes, builtinAttributes, attributeListeners);
        return shipPartial as Ship;
    }

    /**
     * Registers all attribute listeners for this object and all sub-objects
     */
    public registerAttributeListeners(): void {
        for (const attributeListener of this.attributeListeners)
            attributeListener.register();
        for (const ability of this.abilities)
            ability.registerAttributeListeners();
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
            visibilityPattern: this._visibilityPattern.makeTransportable(false),
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
     * @param  x        Destination X coordinate
     * @param  y        Destination Y coordinate
     * @param  rotation Rotation of the ship
     */
    public place(x: number, y: number, rotation: Rotation): void {
        this._x = x;
        this._y = y;
        this._pattern = this._pattern.rotated(rotation);
        this.board.addShip(this);
    }

    /**
     * Sets initial spotting status of this ship
     */
    public spotInitial(): void {
        this.spotOthers();
        this.updateKnown();

        this.owner.team.broadcastEvent({
            event: 'shipAppear',
            trackingID: this.teamTrackingID,
            shipInfo: this.makeTransportable(false)
        }, this.owner);
    }

    /**
     * Spots other ships which are visible to this ship
     */
    private spotOthers(): void {

        // Spot other ships
        for (const [ dx, dy ] of this._pattern.patternEntries) {
            const tile = this.board.tiles[this._y + dy][this._x + dx];
            for (const ship of tile[3])
                if (ship !== this && !ship.spottedBy.includes(this)) {
                    ship.spottedBy.push(this);
                    if (!this.needsSpottingUpdate.includes(ship))
                        this.needsSpottingUpdate.push(ship);
                }
        }

        // Get spotted by other ships
        for (const [dx, dy] of this._visibilityPattern.patternEntries) {
            const tile = this.board.tiles[this._y + dy]?.[this._x + dx];
            const ship = tile?.[2];
            if (ship === undefined || ship === this)
                continue;
            if (!this.spottedBy.includes(ship))
                this.spottedBy.push(ship);
        }
    }

    /**
     * Un-spots other ships which are visible to this ship
     */
    private unSpotOthers(): void {

        // Un-spot other ships
        for (const [ dx, dy ] of this._pattern.patternEntries) {
            const tile = this.board.tiles[this._y + dy][this._x + dx];
            for (const ship of tile[3])
                if (ship !== this && ship.spottedBy.includes(this)) {
                    ship.spottedBy = ship.spottedBy.filter(s => s !== this);
                    if (!this.needsSpottingUpdate.includes(ship))
                        this.needsSpottingUpdate.push(ship);
                }
        }

        // Get un-spotted by other ships
        this.spottedBy = [];
    }

    /**
     * Updates the array of teams who know about the location of this ship
     */
    private updateKnown(): void {

        // Convert old known entries to dictionary for tracking ID lookup
        const oldKnownEntries: { [id: string]: [Team, string] } = {};
        for (const [team, trackingID] of this.knownTo) {
            oldKnownEntries[team.id] = [team, trackingID];
        }

        // Create a new array of [team, trackingID, newlyAppeared] entries
        this.knownTo = [[this.owner.team, this.teamTrackingID, false]];
        const knownToTeams: Team[] = [this.owner.team];
        for (const ship of this.spottedBy) {
            const team = ship.owner.team;
            const previousEntry = oldKnownEntries[team.id];

            if (knownToTeams.includes(team))
                continue;

            const newlyAppeared = previousEntry === undefined;
            const trackingID = newlyAppeared ? v4() : previousEntry[1];

            if (newlyAppeared)
                team.broadcastEvent({
                    event: 'shipAppear',
                    trackingID: trackingID,
                    shipInfo: this.makeTransportable(false)
                });

            this.knownTo.push([team, trackingID, newlyAppeared]);
            knownToTeams.push(team);
        }

        for (const [team, trackingID] of Object.values(oldKnownEntries)) {
            if (!knownToTeams.includes(team))
                team.broadcastEvent({
                    event: 'shipDisappear',
                    trackingID: trackingID
                });
        }
    }

    /**
     * Updates known state of surrounding ships after a ship movement or rotation
     */
    private updateOthers(): void {
        for (const ship of this.needsSpottingUpdate)
            ship.updateKnown();
        this.needsSpottingUpdate = [];
    }

    /**
     * Moves the ship to a new location on the board
     *
     * @param  x Destination X coordinate
     * @param  y Destination Y coordinate
     */
    public moveTo(x: number, y: number): void {
        this.unSpotOthers();
        this.board.removeShip(this);
        this._x = x;
        this._y = y;
        this.board.addShip(this);
        this.spotOthers();
        this.updateKnown();
        this.updateOthers();

        // Broadcast movement to other teams which know of this ship
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
     * Tries to move the ship to a new location on the board
     *
     * @param    x Destination X coordinate
     * @param    y Destination Y coordinate
     * @returns    Whether the movement was successful
     */
    public tryMoveTo(x: number, y: number): boolean {
        const movementAllowed = this.board.checkMovement(this, x, y);
        if (movementAllowed)
            this.moveTo(x, y);
        return movementAllowed;
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
     * Tries to move the ship by an offset
     *
     * @param    x Horizontal distance to move ship by
     * @param    y Vertical distance to move ship by
     * @returns    Whether the movement was successful
     */
    public tryMoveBy(x: number, y: number): boolean {
        return this.tryMoveTo(this._x + x, this._y + y);
    }

    /**
     * Rotates the ship in place
     *
     * @param  rotation Amount to rotate ship by
     */
    public rotateBy(rotation: Rotation): void {
        this.unSpotOthers();
        this.board.removeShip(this);
        this._pattern = this._pattern.rotated(rotation);
        this._visibilityPattern = this._visibilityPattern.rotated(rotation);
        this.board.addShip(this);
        this.spotOthers();
        this.updateKnown();
        this.updateOthers();

        // Broadcast rotation to other teams which know of this ship
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
     * Tries to rotate the ship in place
     *
     * @param    rotation Amount to rotate ship by
     * @returns           Whether the rotation was successful
     */
    public tryRotateBy(rotation: Rotation): boolean {
        const rotationAllowed = this.board.checkRotation(this, rotation);
        if (rotationAllowed)
            this.rotateBy(rotation);
        return rotationAllowed;
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

    public get visibilityPattern(): RotatablePattern {
        return this._visibilityPattern;
    }
}
