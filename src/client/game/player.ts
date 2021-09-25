import { nameFromIdentity } from '../../shared/utility';
import { selfIdentity } from './sockets/event-handlers/connection-info';
import { Team } from './team';

export let selfPlayer: Player;
export let allPlayers: { [id: string]: Player } = {};

/**
 * Player - Client Version
 *
 * Contains game information for a single player
 */
export class Player {
    public team: Team | undefined;
    public readonly lobbyElement: JQuery;

    public color: string | undefined;

    /**
     * Player constructor
     *
     * Also adds new player to dictionary of all players
     *
     * @param  identity Identity string for the player
     */
    public constructor(public readonly identity: string) {

        // Add self to list of all players
        allPlayers[this.identity] = this;

        // If player identity matches our identity, record self player
        if (this.identity === selfIdentity)
            selfPlayer = this;

        // Create representation of player in lobby
        this.lobbyElement = createPlayerElements(this, $('#unassigned-pane'));
    }

    /**
     * Removes this player from dictionary of all players
     *
     * Removed this player from parent team
     */
    public deconstruct(): void {
        this.team?.removePlayer(this);
        delete allPlayers[this.identity];
        this.lobbyElement.remove();
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
}

/**
 * Creates set of elements representing a player during the lobby stage of the game
 *
 * @param    player Player to create elements for
 * @param    pane   Pane to place player elements under
 * @returns         Created parent element
 */
export function createPlayerElements(player: Player, pane: JQuery): JQuery {

    // Get display name from client identity string
    const playerName = nameFromIdentity(player.identity);

    // Create new element for player using identity and name. Add to pane
    const playerElement = $('<div class=""/>');
    playerElement.text(playerName);
    pane.append(playerElement);

    return playerElement;
}
