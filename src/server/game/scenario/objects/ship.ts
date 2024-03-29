import { Rotation }                                                               from 'shared/scenario/rotation';
import { v4 }                                                                     from 'uuid';
import { UnpackingError }                                                         from '../errors/unpacking-error';
import { EventListenerPrimaryPriority }                                           from '../events/event-listener';
import { EventRegistrar }                                                         from '../events/event-registrar';
import { checkAgainstSchema }                                                     from '../schema-checker';
import { getJSONFromEntry }                                                       from '../unpacker';
import { buildAbility }                                                           from './abilities/ability-builder';
import { getEventListenersFromActionSource }                                      from './actions/action-getter';
import { getAttributeListeners }                                                  from './attribute-listeners/attribute-listener-getter';
import { AttributeCodeControlled }                                                from './attributes/attribute-code-controlled';
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
import type { Region }                                                            from './region';
import type { Scenario }                                                          from './scenario';
import type { IShipSource }                                                       from './sources/ship';
import type { Team }                                                              from './team';
import type { AbilityInfo }                                                       from 'shared/network/scenario/ability-info';
import type { AbilityUsabilityInfo }                                              from 'shared/network/scenario/ability-usability-info';
import type { AttributeUpdates }                                                  from 'shared/network/scenario/i-attribute-info';
import type { IShipInfo, IShipPrototypeInfo }                                     from 'shared/network/scenario/i-ship-prototype-info';

/**
 * Ship - Server Version
 *
 * Movable object that exists on the board
 */
export class Ship implements IAttributeHolder, IBuiltinAttributeHolder<'ship'> {

    private _x = 0;
    private _y = 0;
    private _destroyed = false;

    private _visibilityPattern: RotatablePattern;

    public readonly teamTrackingID: string = v4();

    private spottedBy: Ship[] = [];
    private spottedByCount = 0;
    private needsSpottingUpdate: Ship[] = [];

    private oldKnownTo: { [id: string]: [team: Team, trackingID: string] } = {};
    private knownTo: { [id: string]: [team: Team, trackingID: string] } = {};

    private readonly attributeWatcher: AttributeWatcher;
    private hasMoved = false;

    private currentRotation: Rotation = Rotation.None;
    private rotatedBy: Rotation = Rotation.None;
    
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
                       private _pattern: RotatablePattern,
                       private _visibility: number,
                       public readonly abilities: Ability[],
                       public readonly eventRegistrar: EventRegistrar<ShipEventInfo, ShipEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly builtinAttributes: BuiltinAttributeRecord<'ship'>,
                       private readonly attributeListeners: AttributeListener[]) {
        
        this._visibilityPattern = this._pattern.getExtendedPattern(this._visibility);
        this.attributeWatcher = new AttributeWatcher(this.attributes, this.builtinAttributes);

        this.eventRegistrar.eventEvaluationCompleteCallback = () => {
            this.exportChanges();
            this.updateAbilities();
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
        this.updateOthers();
        this.board.removeShip(this);
        this._destroyed = true;
    }

    /**
     * Generates built-in attributes for Ship object
     *
     * @param    object Object to generate built-in attributes for
     * @returns         Record of built-in attributes for the object
     */
    private static generateBuiltinAttributes(object: Ship): BuiltinAttributeRecord<'ship'> {
        return {
            size: new AttributeCodeControlled(undefined, true, () => object._pattern.patternEntries.length, () => {}),
            abilityCount: new AttributeCodeControlled(undefined, true, () => object.abilities.length, () => {}),
            visibility: new AttributeCodeControlled(
                new Descriptor('Visibility', 'Number of tiles from which this ship is visible to other teams'),
                false,
                () => object._visibility,
                (value: number) => {
                    value = Math.min(Math.round(Math.abs(value)), 15);
                    object._visibility = value;
                    object.unSpot();
                    object._visibilityPattern = object._pattern.getExtendedPattern(value);
                    object.spot();
                    object.updateKnown();
                    object.updateOthers();
                }),
            spottedBy: new AttributeCodeControlled(
                new Descriptor('Spotted By', 'Number of enemy ships which can see this ship'),
                true,
                () => object.spottedByCount,
                (newValue) => object.spottedByCount = newValue
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
        const pattern = await RotatablePattern.fromSource(parsingContext.withExtendedPath('.pattern'), shipSource.pattern, true, false);
        parsingContext.reducePath();

        // Get abilities
        const abilities: Ability[] = [];
        const subRegistrars: EventRegistrar<ShipEventInfo, ShipEvent>[] = [];
        for (let i = 0; i < shipSource.abilities.length; i++) {
            const abilityName = shipSource.abilities[i];

            // If ship does not exist
            if (!(abilityName in parsingContext.abilityEntries))
                throw new UnpackingError(`Could not find 'abilities/${abilityName}${parsingContext.scenarioFileExtension}'`, parsingContext);

            // If ability already exists
            if (abilityName in abilities)
                throw new UnpackingError(`Ship cannot define the same ability twice '${abilityName}' at '${parsingContext.currentPath}.abilities[${i}]'`, parsingContext);

            // Unpack ability data
            const abilitySource: AbilitySource = await getJSONFromEntry(parsingContext.abilityEntries[abilityName], parsingContext.scenarioFormat) as unknown as AbilitySource;
            const ability = await buildAbility(parsingContext.withFile(`abilities/${abilityName}${parsingContext.scenarioFileExtension}`), abilitySource, true);
            subRegistrars.push(ability.eventRegistrar);
            parsingContext.reduceFileStack();
            abilities.push(ability);
        }

        const eventListeners = await getEventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), shipEventInfo, shipSource.actions);
        parsingContext.reducePath();

        // Return created Ship object
        parsingContext.localAttributes.ship = undefined;
        parsingContext.shipPartial = undefined;
        EventRegistrar.call(eventRegistrarPartial, parsingContext.scenarioPartial as Scenario, eventListeners, subRegistrars);
        Ship.call(shipPartial, parsingContext.playerPartial as Player, parsingContext.boardPartial as Board, descriptor, pattern, shipSource.visibility, abilities, eventRegistrarPartial, attributes, builtinAttributes, attributeListeners);
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
     * @param    prototypeOnly            Whether to export IShipPrototypeInfo or IShipInfo
     * @param    includeSubAbilityDetails Whether to include details about which sub-abilities are usable
     * @returns                           Created IShipPrototype | IShipInfo object
     */
    public makeTransportable(prototypeOnly: false, includeSubAbilityDetails: boolean): IShipInfo;
    public makeTransportable(prototypeOnly: true, includeSubAbilityDetails: boolean): IShipPrototypeInfo;
    public makeTransportable(prototypeOnly: boolean, includeSubAbilityDetails: boolean): IShipPrototypeInfo | IShipInfo {
        const abilityInfo: AbilityInfo[] = [];
        for (const ability of this.abilities)
            abilityInfo.push(ability.makeTransportable(includeSubAbilityDetails));

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
        if (rotation !== Rotation.None) {
            this._pattern = this._pattern.rotated(rotation);
            for (const ability of this.abilities)
                ability.onShipRotate(rotation);
        }
        this.board.addShip(this);
    }

    /**
     * Spots ships which are visible to this ship and causes other ships to spot this ship
     */
    private spot(): void {

        // Spot other ships
        for (const [dx, dy] of this._pattern.patternEntries) {
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
        for (const [dx, dy] of this._pattern.patternEntries) {
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

            this.knownTo[team.id] ??= previousEntry === undefined
                ? [ team, v4() ]
                : previousEntry;
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
     * Returns the tracking ID of this ship for a team if this ship is known to that team
     *
     * @param    team Team to check if this ship is known to
     * @returns       Tracking ID of this ship for that team
     */
    public getTrackingID(team: Team): string | undefined {
        for (const knownEntry of Object.values(this.knownTo)) {
            if (knownEntry[0] === team)
                return knownEntry[1];
        }
        return undefined;
    }

    /**
     * Retrieves an array of tile coordinates and regions that this ship occupies
     *
     * @returns  [tileCoordinates, regions]
     */
    private getTilesAndRegions(): [string[], Region[]] {
        const tileCoordinates: string[] = [];
        const regions: Region[] = [];
        for (const [dx, dy] of this._pattern.patternEntries) {
            const x = this._x + dx;
            const y = this._y + dy;
            tileCoordinates.push(`${x},${y}`);
            const tileRegions = this.board.tiles[y][x][1];
            for (const region of tileRegions)
                if (!regions.includes(region))
                    regions.push(region);
        }
        return [tileCoordinates, regions];
    }

    /**
     * Determines which tile coordinates have changed between two arrays and raises board events accordingly
     *
     * @param  oldTileCoordinates Array of tile coordinates which this ship used to occupy
     * @param  newTileCoordinates Array of tile coordinates which this ship currently occupies
     */
    private queueTileChangeEvents(oldTileCoordinates: string[], newTileCoordinates: string[]): void {
        const eventRegistrar = this.owner.team.scenario.board.eventRegistrar;

        for (const oldTileCoordinate of oldTileCoordinates) {
            const [stringX, stringY] = oldTileCoordinate.split(',');
            const x = parseInt(stringX);
            const y = parseInt(stringY);
            if (newTileCoordinates.includes(oldTileCoordinate))
                // Tile unchanged
                eventRegistrar.queueEvent('onShipMoveOverTile', {
                    builtinAttributes: {},
                    foreignTeam: this.owner.team,
                    foreignPlayer: this.owner,
                    foreignShip: this,
                    locations: {
                        tile: [[x, y]]
                    }
                });
            else
                // Tile left
                eventRegistrar.queueEvent('onShipLeaveTile', {
                    builtinAttributes: {},
                    foreignTeam: this.owner.team,
                    foreignPlayer: this.owner,
                    foreignShip: this,
                    locations: {
                        tile: [[x, y]]
                    }
                });
        }

        for (const newTileCoordinate of newTileCoordinates) {
            if (!oldTileCoordinates.includes(newTileCoordinate)) {
                // Tile entered
                const [stringX, stringY] = newTileCoordinate.split(',');
                const x = parseInt(stringX);
                const y = parseInt(stringY);
                eventRegistrar.queueEvent('onShipEnterTile', {
                    builtinAttributes: {},
                    foreignTeam: this.owner.team,
                    foreignPlayer: this.owner,
                    foreignShip: this,
                    locations: {
                        tile: [[x, y]]
                    }
                });
            }
        }
    }

    /**
     * Determines which regions have changed between two arrays and raises board events accordingly
     *
     * @param  oldRegions Array of regions which this ship used to occupy
     * @param  newRegions Array of regions which this ship currently occupies
     */
    private queueRegionChangeEvents(oldRegions: Region[], newRegions: Region[]): void {
        const eventRegistrar = this.owner.team.scenario.board.eventRegistrar;

        for (const region of oldRegions) {
            if (newRegions.includes(region))
                // Region unchanged
                eventRegistrar.queueEvent('onShipMoveWithinRegion', {
                    builtinAttributes: {},
                    foreignTeam: this.owner.team,
                    foreignPlayer: this.owner,
                    foreignShip: this,
                    locations: {
                        region: region.tiles
                    },
                    region: region
                });
            else
                // Region left
                eventRegistrar.queueEvent('onShipLeaveRegion', {
                    builtinAttributes: {},
                    foreignTeam: this.owner.team,
                    foreignPlayer: this.owner,
                    foreignShip: this,
                    locations: {
                        region: region.tiles
                    },
                    region: region
                });
        }

        for (const region of newRegions) {
            if (!oldRegions.includes(region))
                // Region entered
                eventRegistrar.queueEvent('onShipEnterRegion', {
                    builtinAttributes: {},
                    foreignTeam: this.owner.team,
                    foreignPlayer: this.owner,
                    foreignShip: this,
                    locations: {
                        region: region.tiles
                    },
                    region: region
                });
        }
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
        const [oldTileCoordinates, oldRegions] = this.getTilesAndRegions();
        this._x = x;
        this._y = y;
        this.board.addShip(this);
        this.spot();
        this.updateKnown();
        this.updateOthers();
        const [newTileCoordinates, newRegions] = this.getTilesAndRegions();
        this.queueTileChangeEvents(oldTileCoordinates, newTileCoordinates);
        this.queueRegionChangeEvents(oldRegions, newRegions);
        this.hasMoved = true;
    }

    /**
     * Checks whether this ship can move to a new location on the board
     *
     * @param    dx Horizontal distance to move ship by
     * @param    dy Vertical distance to move ship by
     * @returns     Whether this shop can move to the new location
     */
    public canMoveBy(dx: number, dy: number): boolean {
        return this.board.checkMovement(this, this._x + dx, this._y + dy);
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
    public rotateBy(rotation: Rotation): void {
        this.unSpot();
        this.board.removeShip(this);
        this._pattern = this._pattern.rotated(rotation);
        this._visibilityPattern = this._visibilityPattern.rotated(rotation);
        this.board.addShip(this);
        this.spot();
        this.updateKnown();
        this.updateOthers();

        for (const ability of this.abilities)
            ability.onShipRotate(rotation);

        this.currentRotation += rotation;
        this.rotatedBy += rotation;
        this.rotatedBy %= Rotation.FullRotation;
    }

    /**
     * Checks whether this ship can be rotated in place
     *
     * @param    rotation Amount to rotate ship by
     * @returns           Whether this shop can rotate by the specified amount
     */
    public canRotateBy(rotation: Rotation): boolean {
        return this.board.checkRotation(this, rotation);
    }

    /**
     * Checks which abilities attached to this ship are usable
     */
    private updateAbilities(): void {

        // Update usability of all abilities and construct array of usability for each ability
        const subAbilityUsabilityUpdates: boolean[] = [];
        let sendUpdate = false;
        for (const ability of this.abilities) {
            const usabilityUpdated = ability.checkUsable();
            subAbilityUsabilityUpdates.push(usabilityUpdated[1]);

            // Send update if usability has changed upon update
            sendUpdate ||= usabilityUpdated[0] || usabilityUpdated[1];
        }

        if (!sendUpdate)
            return;

        const localTeamAbilityUsabilityUpdates: (boolean | AbilityUsabilityInfo)[] = [];
        const foreignTeamAbilityUsabilityUpdates: (boolean | AbilityUsabilityInfo)[] = [];

        // Construct ability usability update arrays for local and foreign teams that know of this ship
        for (let i = 0; i < this.abilities.length; i++) {
            const ability = this.abilities[i];
            const subAbilityUsabilityUpdated = subAbilityUsabilityUpdates[i];

            // Only provide boolean if sub-ability usability has not changed
            if (!subAbilityUsabilityUpdated) {
                localTeamAbilityUsabilityUpdates.push(ability.usable);
                foreignTeamAbilityUsabilityUpdates.push(ability.usable);

            // Otherwise, provide full information
            } else {
                localTeamAbilityUsabilityUpdates.push(ability.getFullUsability(true));
                foreignTeamAbilityUsabilityUpdates.push(ability.getFullUsability(false));
            }
        }

        for (const [team, trackingID] of Object.values(this.knownTo))
            team.broadcastEvent({
                event: 'shipAbilityUpdate',
                trackingID: trackingID,
                usabilityUpdates: team === this.owner.team
                    ? localTeamAbilityUsabilityUpdates
                    : foreignTeamAbilityUsabilityUpdates
            });
    }

    /**
     * Notifies clients of any attribute updates which have occurred on this ship
     */
    private exportChanges(): void {

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
                shipInfo ??= this.makeTransportable(false, false);
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

                if (this.rotatedBy !== Rotation.None)
                    team.broadcastEvent({
                        event: 'shipRotate',
                        trackingID: trackingID,
                        rotation: this.rotatedBy
                    });
            }
        }

        this.hasMoved = false;
        this.rotatedBy = Rotation.None;
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

    public get destroyed(): boolean {
        return this._destroyed;
    }

    public get pattern(): RotatablePattern {
        return this._pattern;
    }

    public get visibilityPattern(): RotatablePattern {
        return this._visibilityPattern;
    }
}
