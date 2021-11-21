import { ValueConstraint }        from './value-constaint';
import type { EvaluationContext } from '../../evaluation-context';

/**
 * EmptyValueConstraint - Server Version
 *
 * Does not perform any checks on a value
 *
 * Values will not be constrained
 */
export class EmptyValueConstraint extends ValueConstraint {

    /**
     * Checks whether or not a value meets this constraint
     *
     * @returns  Values will always meet this constraint
     */
    public check(): boolean {
        return true;
    }

    /**
     * Changes a value to meet this constraint
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @param    value             Value to constrain
     * @returns                    Unrestrained original value
     */
    public constrain(evaluationContext: EvaluationContext, value: number): number {
        return value;
    }
}
