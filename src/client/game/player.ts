import { nameFromIdentity } from 'shared/utility';
import { selfIdentity }     from './sockets/event-handlers/connection-info';
import type { Team }        from 'client/game/team';

export let selfPlayer: Player;
export let allPlayers: { [id: string]: Player } = {};

/**
 * Player - Client Version
 *
 * Contains game information for a single player
 */
export class Player {
    public readonly name: string;
    public team: Team | undefined;
    public readonly lobbyElement: JQuery;

    public color: string | undefined;
    public highlightColor: string | undefined;

    public colorPaletteIndex: number | undefined;

    /**
     * Player constructor
     *
     * Also adds new player to dictionary of all players
     *
     * @param  identity Identity string for the player
     * @param  ready    Whether or not the player is ready
     */
    public constructor(public readonly identity: string,
                       ready: boolean) {

        this.name = nameFromIdentity(this.identity);

        // Add self to list of all players
        allPlayers[this.identity] = this;

        // If player identity matches our identity, record self player
        if (this.identity === selfIdentity)
            selfPlayer = this;

        // Create representation of player in lobby
        this.lobbyElement = this.createLobbyElements($('#unassigned-players'));

        if (ready)
            this.ready(true);
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        this.team?.removePlayer(this);
        delete allPlayers[this.identity];
        this.lobbyElement.remove();
    }

    /**
     * Creates set of elements representing the player during the lobby stage of the game
     *
     * @param    pane Pane to place player elements under
     * @returns       Created parent element
     */
    private createLobbyElements(pane: JQuery): JQuery {

        // Get display name from client identity string
        const playerName = nameFromIdentity(this.identity);

        // Create new element for player using identity and name. Add to pane
        const playerElement = $('<span class="player me-2 py-1 px-2 rounded-3"></span>');
        playerElement.text(playerName);
        pane.append(playerElement);

        return playerElement;
    }

    /**
     * Reassigns the player to a new team
     *
     * @param  team New team to assign this player to
     */
    public assignTeam(team: Team): void {

        // Remove player from current team and add player to new team
        this.team?.removePlayer(this);
        team.addPlayer(this);

        // Set new parent element for player elements in lobby
        this.lobbyElement.appendTo(this.team!.lobbyPlayerContainerElement);
    }

    /**
     * Alters the shown readiness state of the player
     *
     * @param  readyState New readiness state
     */
    public ready(readyState: boolean): void {
        if (readyState)
            this.lobbyElement.addClass('player-ready');
        else
            this.lobbyElement.removeClass('player-ready');
    }
}
