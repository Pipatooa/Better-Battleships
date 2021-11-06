import type { EvaluationContext } from '../../evaluation-context';

/**
 * AttributeReference - Server Version
 *
 * Base class for references to attributes
 */
export abstract class AttributeReference {

    /**
     * Get the value of the referenced attribute
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Value of the referenced attribute
     */
    public abstract getValue(evaluationContext: EvaluationContext): number;

    /**
     * Set the value of the referenced attribute
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     * @param  value             New value to assign to referenced attribute
     */
    public abstract setValue(evaluationContext: EvaluationContext, value: number): void;

}

