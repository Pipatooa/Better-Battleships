import { AttributeReference }                    from './attribute-reference';
import type { EvaluationContext }                from '../../evaluation-context';
import type { Attribute }                        from '../attributes/attribute';
import type { IAttributeHolder }                 from '../attributes/sources/attribute-holder';
import type { AttributeReferenceObjectSelector } from './sources/attribute-reference';

/**
 * AttributeReferenceForeign - Server Version
 *
 * Provides a reference to an attribute which exists on other objects depending on context
 */
export class AttributeReferenceForeign extends AttributeReference {

    /**
     * AttributeReferenceForeign constructor
     *
     * @param  objectSelector Object selector part of attribute reference string
     * @param  attributeName  Name of referenced attribute
     */
    public constructor(protected readonly objectSelector: AttributeReferenceObjectSelector,
                       protected readonly attributeName: string) {
        super();
    }

    /**
     * Resolves underlying attribute that this attribute refers to under a given evaluation context
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Referenced attribute
     */
    private getAttribute(evaluationContext: EvaluationContext): Attribute {

        let attributeHolder: IAttributeHolder | undefined;

        switch (this.objectSelector) {
            case 'scenario':
                attributeHolder = evaluationContext.scenario;
                break;
            case 'team':
                attributeHolder = evaluationContext.team;
                break;
            case 'player':
                attributeHolder = evaluationContext.player;
                break;
            case 'ship':
                attributeHolder = evaluationContext.ship;
                break;
            case 'ability':
                attributeHolder = undefined;
                break;
        }

        return attributeHolder!.attributes[this.attributeName];
    }

    /**
     * Get the value of the referenced attribute
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Value of the referenced attribute
     */
    public getValue(evaluationContext: EvaluationContext): number {
        return this.getAttribute(evaluationContext).getValue();
    }

    /**
     * Set the value of the referenced attribute
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     * @param  value             New value to assign to referenced attribute
     */
    public setValue(evaluationContext: EvaluationContext, value: number): void {
        this.getAttribute(evaluationContext).setValue(evaluationContext, value);
    }
}
