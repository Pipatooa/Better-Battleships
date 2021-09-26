import { ITeamInfo } from '../../shared/network/scenario/i-team-info';
import { Player } from './player';
import { Descriptor } from './scenario/descriptor';
import { joinTeam } from './sockets/button-functions';

/**
 * Team - Client Version
 *
 * Contains information about a collection of players
 */
export class Team {

    public readonly descriptor: Descriptor;
    public readonly color: string;
    public readonly maxPlayers: number;

    protected _players: Player[] = [];
    public readonly lobbyPlayerContainerElement: JQuery;

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
        this.maxPlayers = teamInfo.maxPlayers;

        // Create pane in lobby for players to join team
        this.lobbyPlayerContainerElement = this.createTeamElements();
    }

    /**
     * Creates set of elements representing a team during the lobby stage of the game
     *
     * @returns  Created parent element
     */
    private createTeamElements(): JQuery {

        // Get teams pane to add sub-elements to
        const teamPaneElement = $('#team-pane');

        // Create a new team element with name and description. Add to team pane
        const teamElement = $('<div class="col-md h-100 d-flex flex-column pb-2 px-2"></div>');
        teamElement.append($('<h3></h3>').text(this.descriptor.name));
        teamElement.append($('<p></p>').text(this.descriptor.description));
        teamPaneElement.append(teamElement);

        // Create a new player container element for team's players. Add to team element
        const teamPlayerContainerElement = $('<div class="container flex-grow-1"></div>');
        teamElement.append(teamPlayerContainerElement);

        // Create a new button to join the team. Add to team element
        const buttonElement = $('<button class="btn btn-secondary w-75 mx-auto join-team-button">Join</button>');
        teamElement.append(buttonElement);

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
