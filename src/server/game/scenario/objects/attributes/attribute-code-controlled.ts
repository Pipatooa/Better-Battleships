import { Attribute }                 from './attribute';
import type { GenericEventContext }  from '../../events/event-context';
import type { EventEvaluationState } from '../../events/event-evaluation-state';
import type { Descriptor }           from '../common/descriptor';

/**
 * AttributeCodeControlled - Server Version
 *
 * Ties a code-controlled named value to an attribute holder object
 */
export class AttributeCodeControlled extends Attribute {

    /**
     * AttributeCodeControlled constructor
     *
     * @param  getValue   Function to obtain the value of this attribute
     * @param  setValue   Function to set the value of this attribute
     * @param  descriptor Optional descriptor for this attribute
     */
    public constructor(public readonly getValue: () => number,
                       public readonly setValue: (eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext, value: number) => void = () => {},
                       descriptor?: Descriptor) {
        super(descriptor);
    }
}
