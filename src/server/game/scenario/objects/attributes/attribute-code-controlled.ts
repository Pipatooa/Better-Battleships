import { Attribute }       from './attribute';
import type { Descriptor } from '../common/descriptor';

/**
 * AttributeCodeControlled - Server Version
 *
 * Ties a code-controlled named value to an attribute holder object
 */
export class AttributeCodeControlled extends Attribute {

    /**
     * AttributeCodeControlled constructor
     *
     * @param  descriptor       Optional descriptor for this attribute
     * @param  readonly         Whether to allow the user to set the value of this attribute
     * @param  getValue         Function to obtain the value of this attribute
     * @param  setValueFunction Function exposed to user to set the value of this attribute
     */
    public constructor(descriptor: Descriptor | undefined,
                       readonly: boolean,
                       public readonly getValue: () => number,
                       private readonly setValueFunction: (value: number) => void) {
        super(descriptor, readonly);
    }

    /**
     * Set the value of this attribute
     *
     * @param  value New value
     */
    public setValue(value: number): void {
        if (this.readonly)
            return;
        this.setValueFunction(value);
        super.setValue(value);
    }

    /**
     * Forcibly sets the value of this attribute even if it is readonly
     *
     * @param  value New value
     */
    public forceSetValue(value: number): void {
        this.setValueFunction(value);
        super.setValue(value);
    }
}
