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
     * @param  getValue         Function to obtain the value of this attribute
     * @param  setValueFunction Function exposed to user to set the value of this attribute
     * @param  readonly         Whether to allow the user to set the value of this attribute
     * @param  descriptor       Optional descriptor for this attribute
     */
    public constructor(public readonly getValue: () => number,
                       private readonly setValueFunction: (value: number) => void,
                       private readonly readonly: boolean,
                       descriptor?: Descriptor) {
        super(descriptor);
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
