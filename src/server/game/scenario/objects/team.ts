import { UnpackingError }                                                         from '../errors/unpacking-error';
import { EventRegistrar }                                                         from '../events/event-registrar';
import { checkAgainstSchema }                                                     from '../schema-checker';
import { getJSONFromEntry }                                                       from '../unpacker';
import { eventListenersFromActionSource }                                         from './actions/action-getter';
import { getAttributeListeners }                                                  from './attribute-listeners/attribute-listener-getter';
import { AttributeCodeControlled }                                                from './attributes/attribute-code-controlled';
import { getAttributes }                                                          from './attributes/attribute-getter';
import { AttributeWatcher }                                                       from './attributes/attribute-watcher';
import { Descriptor }                                                             from './common/descriptor';
import { teamEventInfo }                                                          from './events/team-events';
import { Player }                                                                 from './player';
import { teamSchema }                                                             from './sources/team';
import type { Client }                                                            from '../../sockets/client';
import type { ParsingContext }                                                    from '../parsing-context';
import type { IAttributeHolder, IBuiltinAttributeHolder, BuiltinAttributeRecord } from './attributes/attribute-holder';
import type { AttributeMap }                                                      from './attributes/i-attribute-holder';
import type { TeamEventInfo, TeamEvent }                                          from './events/team-events';
import type { Scenario }                                                          from './scenario';
import type { IPlayerSource }                                                     from './sources/player';
import type { IPlayerConfig, ITeamSource }                                        from './sources/team';
import type { IServerEvent }                                                      from 'shared/network/events/i-server-event';
import type { ITeamInfo }                                                         from 'shared/network/scenario/i-team-info';

/**
 * Team - Server Version
 *
 * Contains information about a collection of players
 */
export class Team implements IAttributeHolder, IBuiltinAttributeHolder<'team'> {

    private _players: Player[] = [];
    protected _lost = false;

    public readonly attributeWatcher: AttributeWatcher;

    /**
     * Team constructor
     *
     * @param  scenario          Scenario that this player belongs to
     * @param  id                ID for team
     * @param  descriptor        Descriptor for team
     * @param  _playerPrototypes Array of potential players for the team
     * @param  color             Team color
     * @param  highlightColor    Team color when highlighted
     * @param  eventRegistrar    Registrar of all team event listeners
     * @param  attributes        Attributes for the team
     * @param  builtinAttributes Built-in attributes for the team
     */
    public constructor(public readonly scenario: Scenario,
                       public readonly id: string,
                       public readonly descriptor: Descriptor,
                       protected _playerPrototypes: Player[][],
                       public readonly color: string,
                       public readonly highlightColor: string,
                       public readonly eventRegistrar: EventRegistrar<TeamEventInfo, TeamEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly builtinAttributes: BuiltinAttributeRecord<'team'>) {

        this.attributeWatcher = new AttributeWatcher(this.attributes, this.builtinAttributes);
        this.eventRegistrar.eventEvaluationCompleteCallback = () => this.exportAttributeUpdates();
    }

    /**
     * Generates built-in attributes for Team object
     *
     * @param    object Object to generate built-in attributes for
     * @returns         Record of built-in attributes for the object
     */
    private static generateBuiltinAttributes(object: Team): BuiltinAttributeRecord<'team'> {
        return {
            playerCount: new AttributeCodeControlled(() => object._players.length, () => {}, true)
        };
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

        // Team and EventRegistrar partials refer to future team and EventRegistrar objects
        const teamPartial: Partial<Team> = Object.create(Team.prototype);
        parsingContext.teamPartial = teamPartial;
        const eventRegistrarPartial = Object.create(EventRegistrar.prototype) as EventRegistrar<TeamEventInfo, TeamEvent>;

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), teamSource.attributes, 'team');
        const builtinAttributes = Team.generateBuiltinAttributes(teamPartial as Team);
        parsingContext.localAttributes.team = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), teamSource.attributeListeners, eventRegistrarPartial);
        parsingContext.reducePath();
        for (const attributeListener of attributeListeners)
            attributeListener.register();

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
        EventRegistrar.call(eventRegistrarPartial, eventListeners, []);
        Team.call(teamPartial, parsingContext.scenarioPartial as Scenario, id, descriptor, playerPrototypes, teamSource.color, teamSource.highlightColor, eventRegistrarPartial, attributes, builtinAttributes);
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
            player.registerAttributeListeners();
        }

        // Clear player prototypes list
        this._playerPrototypes = [];
    }

    /**
     * Broadcasts a server event to all players of this team
     *
     * @param  serverEvent   Event to broadcast
     * @param  excludePlayer Player to exclude from the broadcast
     */
    public broadcastEvent(serverEvent: IServerEvent, excludePlayer?: Player): void {
        for (const player of this._players) {
            if (player === excludePlayer)
                continue;
            player.client!.sendEvent(serverEvent);
        }
    }

    /**
     * Notifies clients of any attribute updates which have occurred on this team
     */
    public exportAttributeUpdates(): void {
        if (!this.attributeWatcher.updatesAvailable)
            return;

        this.scenario.game!.broadcastEvent({
            event: 'teamAttributeUpdate',
            team: this.id,
            attributes: this.attributeWatcher.exportUpdates()
        });
    }

    /**
     * Checks whether all players on this team have lost
     */
    public checkLost(): void {
        for (const player of this.players)
            if (!player.lost)
                return;
        this.lose(false);
    }

    /**
     * Eliminates all players on this team from the game
     *
     * @param  propagateDown Whether to update player's lost status
     */
    public lose(propagateDown: boolean): void {
        if (this._lost)
            return;
        this._lost = true;

        if (this.scenario.checkGameOver())
            return;

        this.eventRegistrar.queueEvent('onTeamLostLocal',  {
            builtinAttributes: {}
        });

        for (const team of Object.values(this.scenario.teams)) {
            if (team === this)
                continue;
            team.eventRegistrar.queueEvent('onTeamLostForeign', {
                builtinAttributes: {},
                foreignTeam: this
            });
        }

        this.eventRegistrar.queueEvent('onTeamLostGeneric',  {
            builtinAttributes: {},
            foreignTeam: this
        });

        if (propagateDown)
            for (const player of this._players)
                player.lose(false);

        if (propagateDown)
            this.eventRegistrar.evaluateEvents();
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

    public get lost(): boolean {
        return this._lost;
    }
}
