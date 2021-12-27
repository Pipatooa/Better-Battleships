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

    public color: string | undefined;
    public highlightColor: string | undefined;

    public colorPaletteIndex: number | undefined;

    private readonly _lobbyElement: JQuery;
    private _turnIndicatorElement: JQuery | undefined;

    private _lost = false;

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
        this._lobbyElement = this.createLobbyElements($('#unassigned-players'));

        if (ready)
            this.ready(true);
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        this.team?.removePlayer(this);
        delete allPlayers[this.identity];
        this._lobbyElement.remove();
    }

    /**
     * Creates set of elements representing the player during the lobby stage of the game
     *
     * @param    pane Pane to place player elements under
     * @returns       Created parent element
     */
    private createLobbyElements(pane: JQuery): JQuery {
        const playerElement = $('<span class="player me-2 py-1 px-2 rounded-3"></span>');
        playerElement.text(this.name);
        pane.append(playerElement);
        return playerElement;
    }

    /**
     * Creates set of elements representing the player within the turn indicator
     */
    public createTurnIndicatorElement(): void {
        this._turnIndicatorElement = $('<div class="turn-indicator py-1 px-2 rounded-3"></div>');
        this._turnIndicatorElement.text(this.name);
        this._turnIndicatorElement.css('--turn-indicator-team-color', this.team!.color);
        $('#sidebar-turn-container').append($('<div class="col"></div>').append(this._turnIndicatorElement));
    }

    /**
     * Reassigns the player to a new team
     *
     * @param  team New team to assign this player to
     */
    public assignTeam(team: Team): void {
        this.team?.removePlayer(this);
        team.addPlayer(this);

        // Set new parent element for player elements in lobby
        this._lobbyElement.appendTo(this.team!.lobbyPlayerContainerElement);
    }

    /**
     * Alters the shown readiness state of the player
     *
     * @param  readyState New readiness state
     */
    public ready(readyState: boolean): void {
        if (readyState)
            this._lobbyElement.addClass('player-ready');
        else
            this._lobbyElement.removeClass('player-ready');
    }

    /**
     * Marks this player as eliminated from the game
     */
    public lose(): void {
        this._lost = true;
    }

    /**
     * Getters and setters
     */

    public get lobbyElement(): JQuery {
        return this._lobbyElement;
    }
    
    public get turnIndicatorElement(): JQuery | undefined {
        return this._turnIndicatorElement;
    }

    public get lost(): boolean {
        return this._lost;
    }
}
