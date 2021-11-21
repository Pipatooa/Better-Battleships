import type { EvaluationContext } from '../../evaluation-context';

/**
 * ValueConstraint - Server Version
 *
 * Base class for value constrains which allow a value to be checked against themselves,
 * or for a value to be changed to meet the constrain
 */
export abstract class ValueConstraint {

    /**
     * Checks whether or not a value meets this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to check
     * @returns                    Whether value met this constraint
     */
    abstract check(evaluationContext: EvaluationContext, value: number): boolean;

    /**
     * Changes a value to meet this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to constrain
     * @returns                    New value that meets this constraint
     */
    abstract constrain(evaluationContext: EvaluationContext, value: number): number;
}
