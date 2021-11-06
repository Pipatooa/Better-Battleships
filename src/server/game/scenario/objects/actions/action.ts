import type { EvaluationContext } from '../../evaluation-context';
import type { Condition } from '../conditions/condition';

/**
 * Action - Server Version
 *
 * Base class for actions which perform game logic when executed
 */
export abstract class Action {

    /**
     * Action constructor
     *
     * @param  condition Condition that must hold true for this action to execute
     */
    protected constructor(public readonly condition: Condition) {
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public abstract execute(evaluationContext: EvaluationContext): void;
}

