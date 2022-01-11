import { TimeoutManager } from 'shared/timeout-manager';
import type { Player }    from './objects/player';
import type { Scenario }  from './objects/scenario';
import type { Team }      from './objects/team';

/**
 * TurnManager - Server Version
 *
 * Responsible for managing how turns are passed between players
 */
export class TurnManager {

    private _turnOrder: Player[] | undefined = undefined;
    private turnIndex = 0;

    private readonly timeoutManager: TimeoutManager<'turnTimeout'>;

    /**
     * TurnManager constructor
     *
     * @param  scenario     Scenario that this turn manager belongs to
     * @param  turnOrdering Definition of how turns should be grouped
     * @param  teams        List of teams to generate player turns for
     * @param  turnTimeout  Time given to each player before their turn is automatically advanced
     */
    public constructor(public readonly scenario: Scenario,
                       public readonly turnOrdering: TurnOrdering,
                       public readonly teams: Team[],
                       public readonly turnTimeout: number) {

        this.timeoutManager = new TimeoutManager({
            turnTimeout: [() => this.advanceTurn(true), this.turnTimeout * 1000, false]
        });
    }

    /**
     * Generates a sequence of turns and starts the turn timer
     */
    public start(): void {
        this.timeoutManager.startTimeout('turnTimeout');
        this._turnOrder![this.turnIndex].eventRegistrar.queueEvent('onTurnStart', {
            builtinAttributes: {},
            locations: {}
        });
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
                for (const team of this.teams)
                    for (const player of team.players)
                        this._turnOrder.push(player);
                break;

            // Do not group player turns by team
            // 1st team, 1st player, 2nd team, 1st player, 1st team, 2nd player...
            case 'player': {
                let i = 0;
                let playersLeft: boolean;
                do {
                    playersLeft = false;
                    for (const team of this.teams) {
                        const player = team.players[i];
                        if (player !== undefined) {
                            this._turnOrder.push(player);
                            playersLeft = true;
                        }
                    }
                    i++;
                } while (playersLeft);
            }
        }
    }

    /**
     * Advances which player's turn is currently in session
     *
     * @param  evaluateEvents Whether to evaluate turn related events immediately
     */
    public advanceTurn(evaluateEvents: boolean): void {
        const startIndex = this.turnIndex;
        const oldPlayer = this._turnOrder![this.turnIndex];
        let newPlayer: Player;

        do {
            this.turnIndex++;
            this.turnIndex %= this._turnOrder!.length;
            newPlayer = this._turnOrder![this.turnIndex];
        } while (this.turnIndex !== startIndex && newPlayer.lost);

        oldPlayer.eventRegistrar.queueEvent('onTurnEnd',  {
            builtinAttributes: {},
            locations: {}
        });
        newPlayer.eventRegistrar.queueEvent('onTurnStart',  {
            builtinAttributes: {},
            locations: {}
        });

        this.scenario.eventRegistrar.queueEvent('onTurnAdvancement', {
            builtinAttributes: {},
            foreignTeam: newPlayer.team,
            foreignPlayer: newPlayer,
            locations: {}
        });

        if (evaluateEvents)
            this.scenario.eventRegistrar.evaluateEvents();

        this.timeoutManager.startTimeout('turnTimeout');
        this.scenario.game?.broadcastEvent({
            event: 'turnAdvancement',
            player: newPlayer.client!.identity
        });
    }

    /**
     * Stops automatic turn advancement from occurring
     */
    public stop(): void {
        this.timeoutManager.stopTimeout('turnTimeout');
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
