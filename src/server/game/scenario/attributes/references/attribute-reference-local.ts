import { EvaluationContext } from '../../evaluation-context';
import { Attribute } from '../attribute';
import { AttributeReference } from './attribute-reference';

/**
 * AttributeReferenceLocal - Server Version
 *
 * Provides a fixed reference to an attribute assigned at scenario creation time
 */
export class AttributeReferenceLocal extends AttributeReference {

    /**
     * AttributeReferenceLocal constructor
     *
     * @param  attribute Fixed attribute to reference
     */
    public constructor(protected readonly attribute: Attribute) {
        super();
    }

    /**
     * Get the value of the referenced attribute
     *
     * @returns  Value of the referenced attribute
     */
    public getValue(): number {
        return this.attribute.value;
    }

    /**
     * Set the value of the referenced attribute
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     * @param  value             New value to assign to referenced attribute
     */
    public setValue(evaluationContext: EvaluationContext, value: number): void {
        this.attribute.value = value;
    }
}