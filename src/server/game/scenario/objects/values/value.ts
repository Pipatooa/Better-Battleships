import type { EvaluationContext } from '../../evaluation-context';

/**
 * Value - Server Version
 *
 * Base class for generic value type
 *
 * When evaluated, values return a number, which can be a dynamic value
 */
export abstract class Value {

    /**
     * Evaluate this dynamic value as a number
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public abstract evaluate(evaluationContext: EvaluationContext): number;
}
