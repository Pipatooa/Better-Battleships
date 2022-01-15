import { checkAgainstSchema }     from '../../schema-checker';
import { Descriptor }             from '../common/descriptor';
import { buildValueConstraint }   from '../constraints/value-constraint-builder';
import { buildValue }             from '../values/value-builder';
import { Attribute }              from './attribute';
import { attributeSchema }        from './sources/attribute';
import type { ParsingContext }    from '../../parsing-context';
import type { IDescriptorSource } from '../common/sources/descriptor';
import type { ValueConstraint }   from '../constraints/value-constaint';
import type { Value }             from '../values/value';
import type { IAttributeSource }  from './sources/attribute';

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
     * @param  constraint   Constraint to apply to held value
     * @param  readonly     Whether this value should be readonly
     */
    public constructor(descriptor: Descriptor | undefined,
                       protected readonly initialValue: Value,
                       protected readonly constraint: ValueConstraint | undefined,
                       public readonly readonly: boolean) {
        super(descriptor);
    }

    /**
     * Factory function to generate AttributeUserControlled from JSON scenario data
     *
     * @param    parsingContext  Context for resolving scenario data
     * @param    attributeSource JSON data for AttributeUserControlled
     * @param    checkSchema     When true, validates source JSON data against schema
     * @returns                  Created AttributeUserControlled object
     */
    public static async fromSource(parsingContext: ParsingContext, attributeSource: IAttributeSource, checkSchema: boolean): Promise<AttributeUserControlled> {

        // Validate JSON data against schema
        if (checkSchema)
            attributeSource = await checkAgainstSchema(attributeSource, attributeSchema, parsingContext);

        let descriptor: Descriptor | undefined;
        if (attributeSource.descriptor !== null || Object.entries(attributeSource.descriptor).length !== 0) {
            descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), attributeSource.descriptor as IDescriptorSource, false);
            parsingContext.reducePath();
        }

        // Get component elements from source
        const initialValue = await buildValue(parsingContext.withExtendedPath('.initialValue'), attributeSource.initialValue, false);
        parsingContext.reducePath();
        let constraint: ValueConstraint | undefined;
        if (attributeSource.constraint === null)
            constraint = undefined;
        else {
            constraint = await buildValueConstraint(parsingContext.withExtendedPath('.constraint'), attributeSource.constraint, false);
            parsingContext.reducePath();
        }

        // Return created AttributeUserControlled object
        return new AttributeUserControlled(descriptor, initialValue, constraint, attributeSource.readonly);
    }

    /**
     * Get the value of this attribute
     *
     * @returns  Value of this attribute
     */
    public getValue(): number {
        if (this.value === undefined)
            this.value = this.initialValue.evaluate({
                builtinAttributes: {},
                locations: {}
            });
        return this.value;
    }

    /**
     * Set the value of this attribute
     *
     * Will constrain given value to meet all held value constraints.
     * If attribute is readonly, new value will be ignored
     *
     * @param  value New value
     */
    public setValue(value: number): void {
        // If value is readonly, ignore new value
        if (this.readonly)
            return;

        // Constrain value before setting new value
        if (this.constraint !== undefined)
            value = this.constraint.constrain({
                builtinAttributes: {},
                locations: {}
            }, value);

        // Set value as new constrained value
        this.value = value;
        super.setValue(value);
    }
}
