import { TimeoutManager } from 'shared/timeout-manager';
import type { Player }    from './objects/player';
import type { Team }      from './objects/team';

/**
 * TurnManager - Server Version
 *
 * Responsible for managing how turns are passed between players
 */
export class TurnManager {

    private _turnOrder: Player[] | undefined = undefined;
    private turnIndex = 0;
    private readonly turnsGenerated = false;

    private readonly timeoutManager: TimeoutManager<'turnTimeout'>;
    public turnAdvancementCallback: (() => any) | undefined = undefined;

    /**
     * TurnManager constructor
     *
     * @param  turnOrdering Definition of how turns should be grouped
     * @param  teams        List of teams to generate player turns for
     * @param  turnTimeout  Time given to each player before their turn is automatically advanced
     */
    public constructor(public readonly turnOrdering: TurnOrdering,
                       public readonly teams: Team[],
                       public readonly turnTimeout: number) {

        this.timeoutManager = new TimeoutManager({
            turnTimeout: [() => this.advanceTurn(), this.turnTimeout * 1000, false]
        });
    }

    /**
     * Generates a sequence of turns and starts the turn timer
     */
    public start(): void {
        this.timeoutManager.startTimeout('turnTimeout');
    }

    /**
     * Generates a list of players turns using the current players from each team
     */
    public generateTurns(): void {
        this._turnOrder = [];
        switch (this.turnOrdering) {

            // Group player turns by team
            // 1st team, 1st player, 1st team, 2nd player, 2nd team, 1st player...
            case 'team':

                for (const team of this.teams) {
                    for (const player of team.players) {
                        this._turnOrder.push(player);
                    }
                }
                break;

            // Do not group player turns by team
            // 1st team, 1st player, 2nd team, 1st player, 1st team, 2nd player...
            case 'player': {
                let i = 0;
                let c = true;
                while (c) {
                    c = false;
                    for (const team of this.teams) {
                        const player = team.players[i];
                        if (player !== undefined) {
                            this._turnOrder.push(player);
                            c = true;
                        }
                    }
                    i += 1;
                }
            }
        }
    }

    /**
     * Advances which player's turn is currently in session
     */
    public advanceTurn(): void {
        const startIndex = this.turnIndex;

        do {
            this.turnIndex += 1;
            this.turnIndex %= this._turnOrder!.length;
        } while (this.turnIndex !== startIndex && this._turnOrder![this.turnIndex].lost);

        this.timeoutManager.startTimeout('turnTimeout');
        if (this.turnAdvancementCallback !== undefined)
            this.turnAdvancementCallback();
    }

    /**
     * Getters and setters
     */

    public get turnOrder(): Player[] {
        return this._turnOrder!;
    }

    public get currentTurn(): Player {
        return this._turnOrder![this.turnIndex];
    }
}

/**
 * List of turn orderings
 */
export const turnOrderings = [
    'player',
    'team'
] as const;

/**
 * Type matching all turn ordering strings
 */
export type TurnOrdering = typeof turnOrderings[number];
