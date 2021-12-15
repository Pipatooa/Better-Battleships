import { EventRegistrar }                                                         from '../events/event-registrar';
import { checkAgainstSchema }                                                     from '../schema-checker';
import { getJSONFromEntry, UnpackingError }                                       from '../unpacker';
import { eventListenersFromActionSource }                                         from './actions/action-getter';
import { getAttributes }                                                          from './attributes/attribute-getter';
import { AttributeSpecial }                                                       from './attributes/attribute-special';
import { Descriptor }                                                             from './common/descriptor';
import { teamEventInfo }                                                          from './events/team-events';
import { Player }                                                                 from './player';
import { teamSchema }                                                             from './sources/team';
import type { IServerEvent }                                                      from '../../../../shared/network/events/i-server-event';
import type { Client }                                                            from '../../sockets/client';
import type { ParsingContext }                                                    from '../parsing-context';
import type { IAttributeHolder, ISpecialAttributeHolder, SpecialAttributeRecord } from './attributes/attribute-holder';
import type { AttributeMap }                                                      from './attributes/i-attribute-holder';
import type { TeamEventInfo, TeamEvent }                                          from './events/team-events';

import type { IPlayerSource }              from './sources/player';
import type { IPlayerConfig, ITeamSource } from './sources/team';
import type { ITeamInfo }                  from 'shared/network/scenario/i-team-info';

/**
 * Team - Server Version
 *
 * Contains information about a collection of players
 */
export class Team implements IAttributeHolder, ISpecialAttributeHolder<'team'> {

    private _players: Player[] = [];

    /**
     * Team constructor
     *
     * @param  id                ID for team
     * @param  descriptor        Descriptor for team
     * @param  _playerPrototypes Array of potential players for the team
     * @param  color             Team color
     * @param  highlightColor    Team color when highlighted
     * @param  eventRegistrar    Registrar of all team event listeners
     * @param  attributes        Attributes for the team
     * @param  specialAttributes Special attributes for the team
     */
    public constructor(public readonly id: string,
                       public readonly descriptor: Descriptor,
                       protected _playerPrototypes: Player[][],
                       public readonly color: string,
                       public readonly highlightColor: string,
                       public readonly eventRegistrar: EventRegistrar<TeamEventInfo, TeamEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly specialAttributes: SpecialAttributeRecord<'team'>) {
        
    }

    /**
     * Generates special attributes for Team object
     *
     * @param    object Object to generate special attributes for
     * @returns         Record of special attributes for the object
     */
    private static generateSpecialAttributes(object: Team): SpecialAttributeRecord<'team'> {
        return {
            playerCount: new AttributeSpecial(() => object._players.length)
        };
    }

    /**
     * Initiates list of players from the player prototypes list
     *
     * @param  clients Clients to assign to player objects
     */
    public setPlayers(clients: Client[]): void {

        // Get player prototypes for this number of players
        const playerPrototypes = this._playerPrototypes[clients.length];

        // Copy player prototype list into player list
        for (let i = 0; i < clients.length; i++) {
            const player = playerPrototypes[i];
            this._players[i] = player;

            // Link client and player objects
            player.client = clients[i];
            clients[i].player = player;

            this.eventRegistrar.addSubRegistrar(player.eventRegistrar);
        }

        // Clear player prototypes list
        this._playerPrototypes = [];
    }

    /**
     * Factory function to generate Team from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    teamSource     JSON data for Team
     * @param    id             ID for team
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Team object
     */
    public static async fromSource(parsingContext: ParsingContext, teamSource: ITeamSource, id: string, checkSchema: boolean): Promise<Team> {

        // Validate JSON data against schema
        if (checkSchema)
            teamSource = await checkAgainstSchema(teamSource, teamSchema, parsingContext);

        // Team partial refers to future team object
        const teamPartial: Partial<Team> = {};
        parsingContext.teamPartial = teamPartial;

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), teamSource.attributes, 'team');
        const specialAttributes = Team.generateSpecialAttributes(teamPartial as Team);
        parsingContext.localAttributes.team = [attributes, specialAttributes];
        parsingContext.reducePath();

        // Get descriptor
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), teamSource.descriptor, false);
        parsingContext.reducePath();

        // Get player prototypes for each possible player count
        const playerPrototypes: Player[][] = [];
        for (let i = 0; i < teamSource.playerConfigs.length; i++) {
            const playerConfigs: IPlayerConfig[] = teamSource.playerConfigs[i];
            const playerCount: number = i + 1;

            // Check player count and length of specified player configs are the same
            if (playerCount !== playerConfigs.length)
                throw new UnpackingError(`'${parsingContext.currentPath}playerConfigs[${i}]' must contain ${playerCount} items`, parsingContext);

            // Get players from player configs
            const players: Player[] = [];
            for (const playerConfig of playerConfigs) {
                const playerName = playerConfig.playerPrototype;

                // If player does not exist
                if (!(playerName in parsingContext.playerPrototypeEntries))
                    throw new UnpackingError(`Could not find 'players/${playerName}.json'`, parsingContext);

                // Unpack player
                const playerSource: IPlayerSource = await getJSONFromEntry(parsingContext.playerPrototypeEntries[playerName]) as unknown as IPlayerSource;
                const player = await Player.fromSource(parsingContext.withFile(`players/${playerName}.json`), playerSource, playerConfig.spawnRegion, playerConfig.color, playerConfig.highlightColor, true);
                parsingContext.reduceFileStack();
                players.push(player);
            }

            // Add list of players to list of possible player configurations
            playerPrototypes.push(players);
        }

        const eventListeners = await eventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), teamEventInfo, teamSource.actions);
        parsingContext.reducePath();

        // Return created Team object
        parsingContext.localAttributes.team = undefined;
        parsingContext.teamPartial = undefined;
        const eventRegistrar = new EventRegistrar(eventListeners, []);
        Team.call(teamPartial, id, descriptor, playerPrototypes, teamSource.color, teamSource.highlightColor, eventRegistrar, attributes, specialAttributes);
        (teamPartial as any).__proto__ = Team.prototype;
        return teamPartial as Team;
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created ITeamInfo object
     */
    public makeTransportable(): ITeamInfo {
        return {
            descriptor: this.descriptor.makeTransportable(),
            maxPlayers: this._playerPrototypes.length,
            color: this.color,
            highlightColor: this.highlightColor
        };
    }

    /**
     * Broadcasts a server event to all players of this team
     *
     * @param  serverEvent Event to broadcast
     */
    public broadcastEvent(serverEvent: IServerEvent): void {
        for (const player of this._players) {
            player.client?.sendEvent(serverEvent);
        }
    }

    /**
     * Getters and setters
     */

    public get playerPrototypes(): Player[][] {
        return this._playerPrototypes;
    }

    public get players(): Player[] {
        return this._players;
    }
}
