import type { EvaluationContext } from '../../evaluation-context';

/**
 * Condition - Server Version
 *
 * Base class for conditions which can be checked to return a boolean value
 */
export abstract class Condition {

    /**
     * Base Condition constructor
     *
     * @param  inverted Whether or not the condition result will be inverted before it is returned
     * @protected
     */
    protected constructor(public readonly inverted: boolean) {
    }

    /**
     * Checks whether or not this condition holds true
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Whether or not this condition holds true
     */
    public abstract check(evaluationContext: EvaluationContext): boolean;
}
