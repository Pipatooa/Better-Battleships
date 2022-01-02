import {
    Rotation
}                                                                                 from 'shared/scenario/objects/common/rotation';
import { v4 }                             from 'uuid';
import { UnpackingError }                 from '../errors/unpacking-error';
import { EventListenerPrimaryPriority }   from '../events/event-listener';
import { EventRegistrar }                 from '../events/event-registrar';
import { checkAgainstSchema }             from '../schema-checker';
import { getJSONFromEntry }               from '../unpacker';
import { buildAbility }                   from './abilities/ability-builder';
import { eventListenersFromActionSource } from './actions/action-getter';
import {
    getAttributeListeners
}                                                                                 from './attribute-listeners/attribute-listener-getter';
import {
    AttributeCodeControlled
}                                                                                 from './attributes/attribute-code-controlled';
import { getAttributes }                                                          from './attributes/attribute-getter';
import { AttributeWatcher }                                                       from './attributes/attribute-watcher';
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
import type { AttributeUpdates }                                                  from 'shared/network/scenario/i-attribute-info';
import type {
    IShipInfo,
    IShipPrototypeInfo
}                                                                                 from 'shared/network/scenario/i-ship-prototype-info';

/**
 * Ship - Server Version
 *
 * Movable object that exists on the board
 */
export class Ship implements IAttributeHolder, IBuiltinAttributeHolder<'ship'> {

    protected _x = 0;
    protected _y = 0;

    protected _visibilityPattern: RotatablePattern;

    public readonly teamTrackingID: string = v4();

    protected spottedBy: Ship[] = [];
    private spottedByCount = 0;

    protected needsSpottingUpdate: Ship[] = [];

    protected oldKnownTo: { [id: string]: [team: Team, trackingID: string] } = {};
    protected knownTo: { [id: string]: [team: Team, trackingID: string] } = {};

    private readonly attributeWatcher: AttributeWatcher;
    private hasMoved = false;
    private rotatedBy: Rotation = Rotation.NoChange;
    
    /**
     * Ship constructor
     *
     * @param  owner              Owner of this ship
     * @param  board              Board that this ship belongs to
     * @param  descriptor         Descriptor for ship
     * @param  _pattern           Pattern describing shape of ship
     * @param  _visibility        Range from which this ship is visible
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
                       private _visibility: number,
                       public readonly abilities: Ability[],
                       public readonly eventRegistrar: EventRegistrar<ShipEventInfo, ShipEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly builtinAttributes: BuiltinAttributeRecord<'ship'>,
                       private readonly attributeListeners: AttributeListener[]) {
        
        this._visibilityPattern = this._pattern.getExtendedPattern(this._visibility);
        this.attributeWatcher = new AttributeWatcher(this.attributes, this.builtinAttributes);

        this.eventRegistrar.eventEvaluationCompleteCallback = () => {
            this.updateAbilities();
            this.exportChanges();
        };

        this.eventRegistrar.addEventListener('onGameStart',
            [EventListenerPrimaryPriority.PostAction, 0, () => {
                this.spot();
                this.updateKnown();
            }]);
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        for (const attributeListener of this.attributeListeners)
            attributeListener.unregister();
        for (const ability of this.abilities)
            ability.deconstruct();
        this.eventRegistrar.deactivate();

        for (const [team, trackingID] of Object.values(this.knownTo)) {
            team.broadcastEvent({
                event: 'shipDestroyed',
                trackingID: trackingID
            });
        }

        this.unSpot();
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
            size: new AttributeCodeControlled(() => object._pattern.patternEntries.length, () => {}, true),
            abilityCount: new AttributeCodeControlled(() => object.abilities.length, () => {}, true),
            visibility: new AttributeCodeControlled(
                () => object._visibility,
                (value: number) => {
                    value = Math.min(Math.round(Math.abs(value)), 15);
                    object._visibility = value;
                    object.unSpot();
                    object._visibilityPattern = object._pattern.getExtendedPattern(value);
                    object.spot();
                    object.updateKnown();
                    object.updateOthers();
                },
                false,
                new Descriptor('Visibility', 'Number of tiles from which this ship is visible to other teams')),
            spottedBy: new AttributeCodeControlled(
                () => object.spottedByCount,
                (newValue) => object.spottedByCount = newValue,
                true,
                new Descriptor('Spotted By', 'Number of ships which can see this ship')
            )
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
        const eventRegistrarPartial = Object.create(EventRegistrar.prototype) as EventRegistrar<ShipEventInfo, ShipEvent>;
        parsingContext.shipPartial = shipPartial;
        
        // Get attributes
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), shipSource.attributes, 'ship');
        const builtinAttributes = Ship.generateBuiltinAttributes(shipPartial as Ship);
        parsingContext.localAttributes.ship = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), shipSource.attributeListeners, eventRegistrarPartial);
        parsingContext.reducePath();

        // Get component elements from source
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), shipSource.descriptor, false);
        parsingContext.reducePath();
        const pattern = await RotatablePattern.fromSource(parsingContext.withExtendedPath('.pattern'), shipSource.pattern, false);
        parsingContext.reducePath();

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
        EventRegistrar.call(eventRegistrarPartial, eventListeners, subRegistrars);
        Ship.call(shipPartial, parsingContext.playerPartial as Player, parsingContext.board!, descriptor, pattern, shipSource.visibility, abilities, eventRegistrarPartial, attributes, builtinAttributes, attributeListeners);
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
            abilities: abilityInfo,
            attributes: this.attributeWatcher.exportAttributeInfo()
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
     * Spots ships which are visible to this ship and causes other ships to spot this ship
     */
    private spot(): void {

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
     * Un-spots ships which are visible to this ship and stops other ships spotting this ship
     */
    private unSpot(): void {

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
     * Updates the array of teams who know about this ship
     */
    private updateKnown(): void {

        // Create a new array of [team, trackingID, newlyAppeared] entries
        const oldKnownEntries = this.knownTo;
        this.knownTo = { [this.owner.team.id]: [this.owner.team, this.teamTrackingID] };
        let spottedByCount = 0;
        for (const ship of this.spottedBy) {
            const team = ship.owner.team;
            const previousEntry = oldKnownEntries[team.id];

            if (team !== this.owner.team)
                spottedByCount++;

            if (this.knownTo[team.id] !== undefined)
                continue;

            if (previousEntry === undefined)
                this.knownTo[team.id] = [team, v4()];
            else
                this.knownTo[team.id] = previousEntry;
        }

        this.builtinAttributes.spottedBy.forceSetValue(spottedByCount);
    }

    /**
     * Updates known status of surrounding ships
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
        this.unSpot();
        this.board.removeShip(this);
        this._x = x;
        this._y = y;
        this.board.addShip(this);
        this.spot();
        this.updateKnown();
        this.updateOthers();
        
        this.hasMoved = true;
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
        this.unSpot();
        this.board.removeShip(this);
        this._pattern = this._pattern.rotated(rotation);
        this._visibilityPattern = this._visibilityPattern.rotated(rotation);
        this.board.addShip(this);
        this.spot();
        this.updateKnown();
        this.updateOthers();

        this.rotatedBy += rotation;
        this.rotatedBy %= Rotation.FullRotation;
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
     * Checks which abilities attached to this ship are usable
     */
    private updateAbilities(): void {

        // Update usability of all abilities and construct array of usability for each ability
        const abilityUsability: boolean[] = [];
        let sendUpdate = false;
        for (const ability of this.abilities) {
            const [usable, oldUsability] = ability.checkUsable();
            abilityUsability.push(usable);

            // Send update if usability has changed upon update
            sendUpdate ||= usable !== oldUsability;
        }

        if (sendUpdate)
            for (const [team, trackingID] of Object.values(this.knownTo))
                team.broadcastEvent({
                    event: 'shipAbilityUpdate',
                    trackingID: trackingID,
                    usability: abilityUsability
                });
    }

    /**
     * Notifies clients of any attribute updates which have occurred on this ship
     */
    private exportChanges(): void {

        console.log('Exporting changes...');

        // Publish ship disappearance
        for (const [team, trackingID] of Object.values(this.oldKnownTo)) {
            if (this.knownTo[team.id] === undefined)
                team.broadcastEvent({
                    event: 'shipDisappear',
                    trackingID: trackingID
                });
        }

        // Fetch attribute updates for abilities
        let updatesAvailable = this.attributeWatcher.updatesAvailable;
        const abilityAttributeUpdates: AttributeUpdates[] = [];
        for (const ability of this.abilities) {
            if (ability.attributeWatcher.updatesAvailable) {
                abilityAttributeUpdates.push(ability.attributeWatcher.exportUpdates());
                updatesAvailable = true;
            } else
                abilityAttributeUpdates.push({});
        }

        // Publish appearance or attribute changes depending on whether this ship was previously known
        const attributeUpdates = this.attributeWatcher.exportUpdates();
        let shipInfo: IShipInfo | undefined;
        for (const knownEntry of Object.values(this.knownTo)) {
            const [team, trackingID] = knownEntry;

            // Ship appearance
            if (this.oldKnownTo[team.id] === undefined && team !== this.owner.team) {
                shipInfo ??= this.makeTransportable(false);
                team.broadcastEvent({
                    event: 'shipAppear',
                    trackingID: trackingID,
                    shipInfo: shipInfo
                });
            } else {

                // Attribute updates
                if (updatesAvailable)
                    team.broadcastEvent({
                        event: 'shipAttributeUpdate',
                        trackingID: trackingID,
                        attributes: attributeUpdates,
                        abilityAttributes: abilityAttributeUpdates
                    });

                if (this.hasMoved)
                    team.broadcastEvent({
                        event: 'shipMove',
                        trackingID: trackingID,
                        x: this._x,
                        y: this._y
                    });

                if (this.rotatedBy !== Rotation.NoChange)
                    team.broadcastEvent({
                        event: 'shipRotate',
                        trackingID: trackingID,
                        rotation: this.rotatedBy
                    });
            }
        }

        this.hasMoved = false;
        this.rotatedBy = Rotation.NoChange;
        this.oldKnownTo = this.knownTo;
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
