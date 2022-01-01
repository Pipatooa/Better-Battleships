import { checkAgainstSchema }        from '../../schema-checker';
import { Descriptor }                from '../common/descriptor';
import { buildValueConstraint }      from '../constraints/value-constraint-builder';
import { buildValue }                from '../values/value-builder';
import { Attribute }                 from './attribute';
import { attributeSchema }           from './sources/attribute';
import type { GenericEventContext }  from '../../events/event-context';
import type { EventEvaluationState } from '../../events/event-evaluation-state';
import type { ParsingContext }       from '../../parsing-context';
import type { IDescriptorSource }    from '../common/sources/descriptor';
import type { ValueConstraint }      from '../constraints/value-constaint';
import type { Value }                from '../values/value';
import type { IAttributeSource }     from './sources/attribute';

/**
 * Attribute - Server Version
 *
 * Ties a user-controlled named value to an attribute holder object
 */
export class AttributeUserControlled extends Attribute {

    private value: number | undefined;
    
    /**
     * AttributeUserControlled constructor
     *
     * @param  descriptor   Optional descriptor for this attribute
     * @param  initialValue Initial value for this attribute
     * @param  constraints  Constraints to apply to held value. Will be applied in order
     * @param  readonly     Whether this value should be readonly
     */
    public constructor(descriptor: Descriptor | undefined,
                       protected readonly initialValue: Value,
                       protected readonly constraints: ValueConstraint[],
                       public readonly readonly: boolean) {
        super(descriptor);
    }

    /**
     * Factory function to generate Attribute from JSON scenario data
     *
     * @param    parsingContext  Context for resolving scenario data
     * @param    attributeSource JSON data for Attribute
     * @param    checkSchema     When true, validates source JSON data against schema
     * @returns                  Created Attribute object
     */
    public static async fromSource(parsingContext: ParsingContext, attributeSource: IAttributeSource, checkSchema: boolean): Promise<AttributeUserControlled> {

        // Validate JSON data against schema
        if (checkSchema)
            attributeSource = await checkAgainstSchema(attributeSource, attributeSchema, parsingContext);

        let descriptor: Descriptor | undefined;
        if (Object.entries(attributeSource.descriptor).length !== 0) {
            descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), attributeSource.descriptor as IDescriptorSource, false);
            parsingContext.reducePath();
        }

        const initialValue = await buildValue(parsingContext.withExtendedPath('.initialValue'), attributeSource.initialValue, false);
        parsingContext.reducePath();

        // Get constraints
        const constraints: ValueConstraint[] = [];
        for (let i = 0; i < attributeSource.constraints.length; i++) {
            const constraintSource = attributeSource.constraints[i];
            const constraint = await buildValueConstraint(parsingContext.withExtendedPath(`.constraints[${i}]`), constraintSource, false);
            parsingContext.reducePath();
            constraints.push(constraint);
        }

        // Return created Attribute object
        return new AttributeUserControlled(descriptor, initialValue, constraints, attributeSource.readonly);
    }

    /**
     * Get the value of this attribute
     *
     * @returns  Value of this attribute
     */
    public getValue(): number {
        if (this.value === undefined)
            this.value = this.initialValue.evaluate({
                builtinAttributes: {}
            });
        return this.value;
    }

    /**
     * Set the value of this attribute
     *
     * Will constrain given value to meet all held value constraints.
     * If attribute is readonly, new value will be ignored
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     * @param  value                New value
     */
    public setValue(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext, value: number): void {
        // If value is readonly, ignore new value
        if (this.readonly)
            return;

        // Iterate through constraints and constrain value accordingly
        for (const constraint of this.constraints) {
            value = constraint.constrain(eventContext, value);
        }

        // Set value as new constrained value
        this.value = value;
        super.setValue(eventEvaluationState, eventContext, value);
    }
}
