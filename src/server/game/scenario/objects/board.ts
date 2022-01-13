import { CharacterMapGenerator }              from 'shared/character-map-generator';
import { arraysEqual }                        from 'shared/utility';
import { UnpackingError }                     from '../errors/unpacking-error';
import { EventListenerPrimaryPriority }       from '../events/event-listener';
import { EventRegistrar }                     from '../events/event-registrar';
import { checkAgainstSchema }                 from '../schema-checker';
import { getActionsFromSource }               from './actions/action-getter';
import { tileEventInfo }                      from './events/board-events';
import { Region }                             from './region';
import { boardSchema }                        from './sources/board';
import { TileType }                           from './tiletype';
import type { Mutable }                       from '../../../../shared/types';
import type { EventContextForEvent }          from '../events/event-context';
import type { EventEvaluationState }          from '../events/event-evaluation-state';
import type { EventListener, EventListeners } from '../events/event-listener';
import type { ParsingContext }                from '../parsing-context';
import type { Action }                        from './actions/action';
import type {
    BoardEvent,
    BoardEventInfo,
    RegionEvent,
    RegionEventInfo,
    TileEvent,
    TileEventInfo
}                             from './events/board-events';
import type { Scenario }      from './scenario';
import type { Ship }          from './ship';
import type { IBoardSource }  from './sources/board';
import type { IBoardInfo }    from 'shared/network/scenario/i-board-info';
import type { ITileTypeInfo } from 'shared/network/scenario/i-tiletype-info';
import type { Rotation }      from 'shared/scenario/rotation';

/**
 * Board - Server Version
 *
 * Stores all information about the tiles of the board and objects on the board
 */
export class Board {

    public readonly size: [number, number];
    private readonly _allShips: Ship[] = [];
    
    private tileTypeUpdates: [string, [number, number][]][] = [];
    private tileTypeUpdateCount = 0;

    /**
     * Board constructor
     *
     * @param  scenario       Scenario that this board belongs to
     * @param  tileTypes      Dictionary of tile types indexed by tile chars which compose the board
     * @param  tiles          2d array of tiles indexed [y][x]
     * @param  regions        Dictionary of regions indexed by ID
     * @param  eventRegistrar Registrar of all board event listeners
     */
    public constructor(public readonly scenario: Scenario,
                       public readonly tileTypes: { [char: string]: TileType },
                       public readonly tiles: Tile[][],
                       public readonly regions: { [id: string]: Region },
                       public readonly eventRegistrar: EventRegistrar<BoardEventInfo, BoardEvent>) {

        this.size = [tiles[0].length, tiles.length];
        this.eventRegistrar.eventEvaluationCompleteCallback = () => this.exportChanges();
    }

    /**
     * Factory function to generate Board from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    boardSource    JSON data from 'board.json' or 'board.yaml'
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Board object
     */
    public static async fromSource(parsingContext: ParsingContext, boardSource: IBoardSource, checkSchema: boolean): Promise<Board> {

        // Validate JSON against schema
        if (checkSchema)
            boardSource = await checkAgainstSchema(boardSource, boardSchema, parsingContext);

        // Board partial refers to future Board object
        const boardPartial: Partial<Board> = Object.create(Board.prototype);
        parsingContext.boardPartial = boardPartial;

        // Unpack tile type palette data
        const tileTypes: { [char: string]: TileType } = {};
        for (const [char, tileTypeSource] of Object.entries(boardSource.tilePalette)) {
            tileTypes[char] = await TileType.fromSource(parsingContext.withExtendedPath(`.palette.${char}`), tileTypeSource, false);
            parsingContext.reducePath();
        }
        (boardPartial as Mutable<Board>).tileTypes = tileTypes;

        // Unpack region palette data
        const regions: { [id: string]: Region } = {};
        const regionPalette: { [char: string]: string[] } = boardSource.regionPalette;
        for (const regionIDs of Object.values(regionPalette)) {
            for (const regionID of regionIDs) {
                if (regions[regionID] === undefined)
                    regions[regionID] = new Region(regionID);
            }
        }

        // Ensure that the number of entries in 'tiles' matches the declared size of the board
        if (boardSource.tiles.length !== boardSource.size[1])
            throw new UnpackingError(`"${parsingContext.currentPathPrefix}tiles" must contain ${boardSource.size[1]} items to match "${parsingContext.currentPathPrefix}size[1]. Found ${boardSource.tiles.length}"`, parsingContext);
        if (boardSource.regions.length !== boardSource.size[1])
            throw new UnpackingError(`"${parsingContext.currentPathPrefix}regions" must contain ${boardSource.size[1]} items to match "${parsingContext.currentPathPrefix}size[1]. Found ${boardSource.regions.length}"`, parsingContext);

        // Unpack tile and region data
        const tiles: Tile[][] = [];
        for (let y = 0; y < boardSource.tiles.length; y++) {
            const tileRow: string = boardSource.tiles[y];
            const regionRow: string = boardSource.regions[y];

            // Ensure that the number of tiles within a row matches the declared size of the board
            if (tileRow.length !== boardSource.size[0])
                throw new UnpackingError(`"${parsingContext.currentPathPrefix}tiles[${y}]" length must be ${boardSource.size[0]} characters long to match "${parsingContext.currentPathPrefix}size[0]. Found ${tileRow.length}"`, parsingContext);
            if (regionRow.length !== boardSource.size[0])
                throw new UnpackingError(`"${parsingContext.currentPathPrefix}regions[${y}]" length must be ${boardSource.size[0]} characters long to match "${parsingContext.currentPathPrefix}size[0]. Found ${regionRow.length}"`, parsingContext);

            // Create new tile row
            tiles[y] = [];

            // Iterate through each character, each representing a tile
            for (let x = 0; x < boardSource.size[0]; x++) {
                const tileChar: string = tileRow.charAt(x);
                const regionChar: string = regionRow.charAt(x);

                const tileType = tileTypes[tileChar];
                const regionIDs = regionPalette[regionChar];

                // If character did not match any tile type within the palette
                if (tileType === undefined)
                    throw new UnpackingError(`Could not find tile of type '${tileChar}' defined at '${parsingContext.currentPathPrefix}tiles[${y}][${x}]' within the palette defined at '${parsingContext.currentPathPrefix}tilePalette'`, parsingContext);
                if (regionIDs === undefined)
                    throw new UnpackingError(`Could not find regions matching '${regionChar}' defined at '${parsingContext.currentPathPrefix}regions[${y}][${x}]' within the palette defined at '${parsingContext.currentPathPrefix}regionPalette'`, parsingContext);

                // Get tile type and add tile to region
                const tileRegions: Region[] = [];
                for (const regionID of regionIDs) {
                    const region = regions[regionID];
                    tileRegions.push(region);
                    region.tiles.push([x, y]);
                }
                tiles[y][x] = [tileType, tileRegions, undefined, []];
            }
        }

        // Get tile event listeners
        const boardEventListeners = {} as EventListeners<BoardEventInfo, BoardEvent>;
        for (const [tileChar, actionSources] of Object.entries(boardSource.tileActions)) {
            const tileType = tileTypes[tileChar];
            if (tileType === undefined)
                throw new UnpackingError(`Could not find tile of type '${tileChar}' defined at '${parsingContext.currentPathPrefix}tileActions.${tileChar}' within the palette defined at '${parsingContext.currentPathPrefix}tilePalette'`,
                    parsingContext);

            const actions = await getActionsFromSource(parsingContext.withExtendedPath('.tileActions'), tileEventInfo, actionSources);
            parsingContext.reducePath();

            // Create event listeners for each event
            for (const entry of Object.entries(actions)) {
                const [eventName, eventActions] = entry as [TileEvent, Action[]];
                if (boardEventListeners[eventName] === undefined)
                    boardEventListeners[eventName] = [];

                // Listener called when a tile event is triggered but before actions are executed
                const listenerCallback = (eventEvaluationState: EventEvaluationState, eventContext: EventContextForEvent<TileEventInfo, TileEvent, any>): void => {
                    // Check if tile type for event call matches this tile type
                    const [ x, y ] = eventContext.locations.tile[0];
                    const tile = (boardPartial as Board).tiles[y][x];
                    if (tile[0] !== tileType)
                        return;

                    // Queue event listener calls for each ability
                    for (const action of eventActions) {
                        const actionListenerCallback = (eventEvaluationState: EventEvaluationState, eventContext: EventContextForEvent<TileEventInfo, TileEvent, any>): void =>
                            action.execute(eventEvaluationState, eventContext);
                        (boardPartial as Board).eventRegistrar.preQueueEventListenerCall([EventListenerPrimaryPriority.ActionDefault, action.priority, actionListenerCallback], eventContext);
                    }
                };
                boardEventListeners[eventName].push([EventListenerPrimaryPriority.PreAction, 0, listenerCallback]);
            }
        }

        // Get region event listeners
        for (const [regionID, actionSources] of Object.entries(boardSource.regionActions)) {
            const region = regions[regionID];
            if (region === undefined)
                throw new UnpackingError(`Could not find region with id '${regionID}' defined at '${parsingContext.currentPathPrefix}regionActions.${regionID}' within the palette defined at '${parsingContext.currentPathPrefix}regionPalette'`,
                    parsingContext);

            const regionEventListeners = await getActionsFromSource(parsingContext.withExtendedPath('.tileActions'), tileEventInfo, actionSources);
            parsingContext.reducePath();

            // Create event listeners for each event
            for (const entry of Object.entries(regionEventListeners)) {
                const [eventName, eventActions] = entry as [RegionEvent, Action[]];
                if (boardEventListeners[eventName] === undefined)
                    boardEventListeners[eventName] = [];

                // Listener called when a region event is triggered but before actions are executed
                const listenerCallback = (eventEvaluationState: EventEvaluationState, eventContext: EventContextForEvent<RegionEventInfo, RegionEvent, any>): void => {
                    // Check if region matches
                    if (eventContext.region !== region)
                        return;

                    // Queue event listener calls for each ability
                    for (const action of eventActions) {
                        const actionListenerCallback = (eventEvaluationState: EventEvaluationState, eventContext: EventContextForEvent<RegionEventInfo, RegionEvent, any>): void =>
                            action.execute(eventEvaluationState, eventContext);
                        (boardPartial as Board).eventRegistrar.preQueueEventListenerCall([EventListenerPrimaryPriority.ActionDefault, action.priority, actionListenerCallback], eventContext);
                    }
                };
                boardEventListeners[eventName].push([EventListenerPrimaryPriority.PreAction, 0, listenerCallback]);
            }
        }

        const eventRegistrar = new EventRegistrar(boardEventListeners, []);

        // Return created Board object
        parsingContext.boardPartial = undefined;
        Board.call(boardPartial, parsingContext.scenarioPartial as Scenario, tileTypes, tiles, regions, eventRegistrar);
        return boardPartial as Board;
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created IBoardInfo object
     */
    public makeTransportable(): IBoardInfo {

        // Create a set of character map generators to convert tile and region grid to string representation
        const tiles: string[] = [];
        const regions: string[] = [];
        const tileTypeMapGenerator = new CharacterMapGenerator<TileType>();
        const regionMapGenerator = new CharacterMapGenerator<Region[]>(arraysEqual);

        // Generate character strings
        for (const tileRow of this.tiles) {
            const rowTileTypes: TileType[] = [];
            const rowRegions: Region[][] = [];
            for (const tile of tileRow) {
                rowTileTypes.push(tile[0]);
                rowRegions.push(tile[1]);
            }

            tiles.push(tileTypeMapGenerator.getString(rowTileTypes));
            regions.push(regionMapGenerator.getString(rowRegions));
        }

        // Export palette info
        const tilePalette: { [char: string]: ITileTypeInfo } = {};
        for (const [char, tileType] of Object.entries(tileTypeMapGenerator.exportMap())) {
            tilePalette[char] = tileType.makeTransportable();
            tileType.exportChar = char;
        }

        const regionPalette: { [char: string]: string[] } = {};
        for (const [char, region] of Object.entries(regionMapGenerator.exportMap())) {
            regionPalette[char] = region.map(r => r.id);
        }

        return {
            size: this.size,
            tilePalette: tilePalette,
            regionPalette: regionPalette,
            tiles: tiles,
            regions: regions
        };
    }

    /**
     * Adds a ship to the board
     *
     * @param  ship Ship to add to the board
     */
    public addShip(ship: Ship): void {
        for (const [dx, dy] of ship.pattern.patternEntries) {
            const tile = this.tiles[ship.y + dy][ship.x + dx];
            tile[2] = ship;
        }
        for (const [dx, dy] of ship.visibilityPattern.patternEntries) {
            const tile = this.tiles[ship.y + dy]?.[ship.x + dx];
            if (tile === undefined)
                continue;
            const visibleShips = tile[3];
            if (!visibleShips.includes(ship))
                visibleShips.push(ship);
        }
    }

    /**
     * Removes a ship from the board
     *
     * @param  ship Ship to remove the board
     */
    public removeShip(ship: Ship): void {
        for (const [dx, dy] of ship.pattern.patternEntries) {
            const tile = this.tiles[ship.y + dy][ship.x + dx];
            tile[2] = undefined;
        }
        for (const [dx, dy] of ship.visibilityPattern.patternEntries) {
            const tile = this.tiles[ship.y + dy]?.[ship.x + dx];
            if (tile === undefined)
                continue;
            tile[3] = tile[3].filter(s => s !== ship);
        }
    }

    /**
     * Checks whether a ship can be placed on this board at a particular location
     *
     * @param    ship        Ship to place
     * @param    rotation    Rotation of ship
     * @param    x           X coordinate of placement
     * @param    y           Y coordinate of placement
     * @param    validRegion Region within which the ship's placement is valid
     * @returns              Whether the ship can be placed at that location
     */
    public checkPlacement(ship: Ship, rotation: Rotation, x: number, y: number, validRegion: Region | undefined): boolean {
        const pattern = ship.pattern.rotated(rotation);
        for (const [dx, dy] of pattern.patternEntries) {
            const tile = this.tiles[y + dy]?.[x + dx];
            if (tile === undefined)
                return false;
            if (validRegion !== undefined && !tile[1].includes(validRegion))
                return false;
            if (tile[2] !== undefined)
                return false;
        }
        return true;
    }

    /**
     * Checks whether a ship can move to a location successfully
     *
     * @param    ship Ship to move
     * @param    x    New X coordinate of ship
     * @param    y    New Y coordinate of ship
     * @returns       Whether the ship can move to the target location
     */
    public checkMovement(ship: Ship, x: number, y: number): boolean {
        for (const [dx, dy] of ship.pattern.patternEntries) {
            const tile = this.tiles[y + dy]?.[x + dx];
            if (tile === undefined)
                return false;
            if (!tile[0].traversable)
                return false;
            if (tile[2] !== undefined && tile[2] !== ship)
                return false;
        }
        return true;
    }

    /**
     * Checks whether a ship can perform a rotation successfully
     *
     * @param    ship     Ship to rotate
     * @param    rotation Rotation to apply
     * @returns           Whether the ship can be rotated
     */
    public checkRotation(ship: Ship, rotation: Rotation): boolean {
        const rotatedPattern = ship.pattern.rotated(rotation);
        for (const [dx, dy] of rotatedPattern.patternEntries) {
            const tile = this.tiles[ship.y + dy]?.[ship.x + dx];
            if (tile === undefined)
                return false;
            if (!tile[0].traversable)
                return false;
            if (tile[2] !== undefined && tile[2] !== ship)
                return false;
        }
        return true;
    }

    /**
     * Replaces tiles on this board with a new tile type
     *
     * @param  tiles    Array of tile coordinates to replace tile types for
     * @param  tileType Tile type to replace tiles with
     */
    public setTileTypes(tiles: [number, number][], tileType: TileType): void {
        for (const [x, y] of tiles)
            this.tiles[y][x][0] = tileType;
        this.tileTypeUpdates.push([tileType.exportChar!, tiles]);
        this.tileTypeUpdateCount += tiles.length;
    }

    /**
     * Replaces tiles on this board with a new tile type
     *
     * @param  tiles       Array of tile coordinates to replace tiles types for
     * @param  oldTileType Tile type to replace
     * @param  newTileType Tile type to replace tiles with
     */
    public replaceTileTypes(tiles: [number, number][], oldTileType: TileType, newTileType: TileType): void {
        const tilesUpdated: [number, number][] = [];
        for (const [x, y] of tiles) {
            const tile = this.tiles[y][x];
            if (tile[0] !== oldTileType)
                continue;
            tile[0] = newTileType;
            tilesUpdated.push([x, y]);
        }
        this.tileTypeUpdates.push([newTileType.exportChar!, tilesUpdated]);
        this.tileTypeUpdateCount += tilesUpdated.length;
    }

    /**
     * Notifies clients of any tile type updates which have occured on this board
     */
    private exportChanges(): void {
        if (!this.tileTypeUpdateCount)
            return;
        
        // Only send changed tiles if less than a third of the board has changed
        if (this.tileTypeUpdateCount < this.size[0] * this.size[1] / 3)
            this.scenario.game!.broadcastEvent({
                event: 'boardUpdate',
                full: false,
                tiles: this.tileTypeUpdates
            });

        // Otherwise, send all tiles
        else {
            const tiles: string[] = [];
            const tileTypeMapGenerator = new CharacterMapGenerator<TileType>(undefined, this.tileTypes);

            // Generate character strings
            for (const tileRow of this.tiles) {
                const rowTileTypes: TileType[] = [];
                for (const tile of tileRow)
                    rowTileTypes.push(tile[0]);
                tiles.push(tileTypeMapGenerator.getString(rowTileTypes));
            }

            this.scenario.game!.broadcastEvent({
                event: 'boardUpdate',
                full: true,
                tiles: tiles
            });
        }
        
        this.tileTypeUpdates = [];
        this.tileTypeUpdateCount = 0;
    }

    /**
     * Getters and setters
     */

    public get allShips(): readonly Ship[] {
        return this._allShips;
    }
}

/**
 * Type describing an entry for a single tile
 */
export type Tile = [TileType, Region[], Ship | undefined, Ship[]];
