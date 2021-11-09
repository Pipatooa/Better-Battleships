import type { ITeamInfo } from '../../../../shared/network/scenario/i-team-info';
import type { Client } from '../../sockets/client';
import type { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { getJSONFromEntry, UnpackingError } from '../unpacker';
import { getAttributes } from './attributes/attribute-getter';
import type { AttributeMap } from './attributes/i-attribute-holder';
import type { IAttributeHolder } from './attributes/sources/attribute-holder';
import { Descriptor } from './common/descriptor';
import { Player } from './player';
import type { IPlayerSource } from './sources/player';
import type { IPlayerConfig, ITeamSource } from './sources/team';
import { teamSchema } from './sources/team';

/**
 * Team - Server Version
 *
 * Contains information about a collection of players
 */
export class Team implements IAttributeHolder {
    private _players: Player[] = [];

    /**
     * Team constructor
     *
     * @param  id                ID for team
     * @param  descriptor        Descriptor for team
     * @param  _playerPrototypes Array of potential players for the team
     * @param  color             Team color
     * @param  highlightColor    Team color when highlighted
     * @param  attributes        Attributes for the team
     */
    public constructor(public readonly id: string,
                       public readonly descriptor: Descriptor,
                       protected _playerPrototypes: Player[][],
                       public readonly color: string,
                       public readonly highlightColor: string,
                       public readonly attributes: AttributeMap) {
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
            this._players[i] = playerPrototypes[i];

            // Link client and player objects
            this._players[i].client = clients[i];
            clients[i].player = this._players[i];
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

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), teamSource.attributes, 'team');
        parsingContext = parsingContext.withTeamAttributes(attributes);

        // Get descriptor
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), teamSource.descriptor, false);

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
                players.push(await Player.fromSource(parsingContext.withUpdatedFile(`players/${playerName}.json`), playerSource, playerConfig.spawnRegion, playerConfig.color, playerConfig.highlightColor, true));
            }

            // Add list of players to list of possible player configurations
            playerPrototypes.push(players);
        }

        // Return created Team object
        return new Team(id, descriptor, playerPrototypes, teamSource.color, teamSource.highlightColor, attributes);
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
     * Getters and setters
     */

    public get playerPrototypes(): Player[][] {
        return this._playerPrototypes;
    }

    public get players(): Player[] {
        return this._players;
    }
}
