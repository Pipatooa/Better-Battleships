import { EventRegistrar }                                                         from '../events/event-registrar';
import { checkAgainstSchema }                                                     from '../schema-checker';
import { getJSONFromEntry, UnpackingError }                                       from '../unpacker';
import { eventListenersFromActionSource }                                         from './actions/action-getter';
import { getAttributeListeners }                                                  from './attribute-listeners/attribute-listener-getter';
import { AttributeCodeControlled }                                                from './attributes/attribute-code-controlled';
import { getAttributes }                                                          from './attributes/attribute-getter';
import { playerEventInfo }                                                        from './events/player-events';
import { Ship }                                                                   from './ship';
import { playerSchema }                                                           from './sources/player';
import type { Client }                                                            from '../../sockets/client';
import type { ParsingContext }                                                    from '../parsing-context';
import type { AttributeListener }                                                 from './attribute-listeners/attribute-listener';
import type { IAttributeHolder, IBuiltinAttributeHolder, BuiltinAttributeRecord } from './attributes/attribute-holder';
import type { AttributeMap }                                                      from './attributes/i-attribute-holder';
import type { PlayerEvent, PlayerEventInfo }                                      from './events/player-events';
import type { IPlayerSource }                                                     from './sources/player';
import type { IShipSource }                                                       from './sources/ship';
import type { Team }                                                              from './team';
import type { IPlayerInfo }                                                       from 'shared/network/scenario/i-player-info';

/**
 * Player - Server Version
 *
 * Contains game information for a single player
 */
export class Player implements IAttributeHolder, IBuiltinAttributeHolder<'player'> {
    
    public client: Client | undefined;

    /**
     * Player constructor
     *
     * @param  team               Team that this player belongs to
     * @param  spawnRegionID      Region that the player should first be allowed to place ships in
     * @param  color              Color for the player
     * @param  highlightColor     Color for the player when highlighted
     * @param  ships              List of ships that belong to the player
     * @param  eventRegistrar     Registrar of all player event listeners
     * @param  attributes         Attributes for the player
     * @param  builtinAttributes  Built-in attributes for the player
     * @param  attributeListeners Attribute listeners for the player
     */
    public constructor(public readonly team: Team,
                       public readonly spawnRegionID: string,
                       public readonly color: string,
                       public readonly highlightColor: string,
                       public readonly ships: Ship[],
                       public readonly eventRegistrar: EventRegistrar<PlayerEventInfo, PlayerEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly builtinAttributes: BuiltinAttributeRecord<'player'>,
                       private readonly attributeListeners: AttributeListener[]) {
    }

    /**
     * Generates built-in attributes for Player object
     *
     * @param    object Object to generate built-in attributes for
     * @returns         Record of built-in attributes for the object
     */
    private static generateBuiltinAttributes(object: Player): BuiltinAttributeRecord<'player'> {
        return {
            shipCount: new AttributeCodeControlled(() => object.ships.length)
        };
    }

    /**
     * Factory function to generate Player from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    playerSource   JSON data for Player
     * @param    spawnRegion    Region that the player should first be allowed to place ships in
     * @param    color          Color for player
     * @param    highlightColor Color for player when highlighted
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Player object
     */
    public static async fromSource(parsingContext: ParsingContext, playerSource: IPlayerSource, spawnRegion: string, color: string, highlightColor: string, checkSchema: boolean): Promise<Player> {

        // Validate JSON data against schema
        if (checkSchema)
            playerSource = await checkAgainstSchema(playerSource, playerSchema, parsingContext);

        // Player partial refers to future player object
        const playerPartial: Partial<Player> = {};
        parsingContext.playerPartial = playerPartial;
        
        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), playerSource.attributes, 'player');
        const builtinAttributes = Player.generateBuiltinAttributes(playerPartial as Player);
        parsingContext.localAttributes.player = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), playerSource.attributeListeners);
        parsingContext.reducePath();

        // Get ships
        const ships: Ship[] = [];
        const subRegistrars: EventRegistrar<PlayerEventInfo, PlayerEvent>[] = [];
        for (const shipName of playerSource.ships) {

            // If ship does not exist
            if (!(shipName in parsingContext.shipEntries))
                throw new UnpackingError(`Could not find 'ships/${shipName}.json'`, parsingContext);

            // Unpack ship data
            const shipSource: IShipSource = await getJSONFromEntry(parsingContext.shipEntries[shipName]) as unknown as IShipSource;
            const ship = await Ship.fromSource(parsingContext.withFile(`ships/${shipName}.json`), shipSource, true);
            subRegistrars.push(ship.eventRegistrar);
            parsingContext.reduceFileStack();
            ships.push(ship);
        }

        const eventListeners = await eventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), playerEventInfo, playerSource.actions);
        parsingContext.reducePath();

        // Return created Player object
        parsingContext.localAttributes.player = undefined;
        parsingContext.playerPartial = undefined;
        const eventRegistrar = new EventRegistrar(eventListeners, subRegistrars);
        Player.call(playerPartial, parsingContext.teamPartial as Team, spawnRegion, color, highlightColor, ships, eventRegistrar, attributes, builtinAttributes, attributeListeners);
        (playerPartial as any).__proto__ = Player.prototype;
        return playerPartial as Player;
    }

    /**
     * Registers all attribute listeners for this object and all sub-objects
     */
    public registerAttributeListeners(): void {
        for (const attributeListener of this.attributeListeners)
            attributeListener.register();
        for (const ship of this.ships)
            ship.registerAttributeListeners();
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created IPlayerInfo object
     */
    public makeTransportable(): IPlayerInfo {
        return {
            ships: this.ships.map(s => s.makeTransportable(true)),
            spawnRegion: this.spawnRegionID
        };
    }
}
