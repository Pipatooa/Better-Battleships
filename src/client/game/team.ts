import { joinTeam }                 from './ui/misc-buttons';
import type { Player }              from './player';
import type { AttributeCollection } from './scenario/attribute-collection';
import type { Descriptor }          from './scenario/descriptor';
import type { ITeamInfo }           from 'shared/network/scenario/i-team-info';

export const allTeams: { [id: string]: Team } = {};

/**
 * Team - Client Version
 *
 * Contains information about a collection of players
 */
export class Team {

    public readonly descriptor: Descriptor;
    public readonly color: string;
    public colorPaletteIndex: number | undefined;
    public readonly highlightColor: string;
    public readonly maxPlayers: number;

    protected _players: Player[] = [];
    public readonly lobbyPlayerContainerElement: JQuery;
    public attributeCollection: AttributeCollection | undefined;

    /**
     * Team constructor
     *
     * @param  id       ID for team
     * @param  teamInfo Network transportable version of team object containing team info
     */
    public constructor(public readonly id: string,
                       teamInfo: ITeamInfo) {

        this.descriptor = teamInfo.descriptor;
        this.color = teamInfo.color;
        this.highlightColor = teamInfo.highlightColor;
        this.maxPlayers = teamInfo.maxPlayers;

        // Create pane in lobby for players to join team
        this.lobbyPlayerContainerElement = this.createTeamElements();
        allTeams[this.id] = this;
    }

    /**
     * Creates set of elements representing a team during the lobby stage of the game
     *
     * @returns  Created parent element
     */
    private createTeamElements(): JQuery {

        // Get teams pane to add sub-elements to
        const teamPaneElement = $('#teams-list');

        // Create a new team element with name and description. Add to team pane
        const teamElement = $('<div class="p-3 border-bottom border-dark"><div class="d-flex"></div></div>');
        const teamInfoElement = $('<div class="flex-grow-1"></div>');
        teamInfoElement.append($('<h5 class="mb-0"></h5>').append($('<b></b>').text(this.descriptor.name)));
        teamInfoElement.append($('<p></p>').text(this.descriptor.description));
        teamElement.children().first().append(teamInfoElement);

        // Container for player elements
        const teamPlayerContainerElement = $('<div></div>');
        teamInfoElement.append(teamPlayerContainerElement);

        // Add team to list of teams
        teamPaneElement.append(teamElement);

        const buttonElement = $('<button class="btn join-team-button text-center btn-dark">Join</button>');
        teamElement.children().first().append($('<div></div>').append(buttonElement));

        // Register click handler for join team button
        buttonElement.on('click', () => {
            joinTeam(this.id);
        });

        // Store pane element
        return teamPlayerContainerElement;
    }

    /**
     * Adds a player to this team
     *
     * @param  player Player to add to the team
     */
    public addPlayer(player: Player): void {
        this._players.push(player);
        player.team = this;
    }

    /**
     * Removes a player from this team
     *
     * @param  player Player to remove from the team
     */
    public removePlayer(player: Player): void {
        this._players = this._players.filter(p => p !== player);
        player.team = undefined;
    }

    /**
     * Getters and setters
     */

    public get players(): Player[] {
        return this._players;
    }
}
