import { Attribute }                from './attribute';
import type { GenericEventContext } from '../../events/event-context';

/**
 * AttributeSpecial - Server Version
 *
 * Ties a code-controlled named value to an attribute holder object
 */
export class AttributeCodeControlled extends Attribute {
    public constructor(public readonly getValue: () => number,
                       public readonly setValue: (eventContext: GenericEventContext, value: number) => void = () => {}) {
        super();
    }
}
