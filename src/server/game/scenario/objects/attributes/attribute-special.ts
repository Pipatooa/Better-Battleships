import { Attribute }                from './attribute';
import type { GenericEventContext } from '../../events/event-context';

/**
 * AttributeSpecial - Server Version
 *
 * Ties a code-controlled named value to an attribute holder object
 */
export class AttributeSpecial extends Attribute {
    public constructor(public readonly getValue: () => number,
                       public readonly setValue: (eventContext: GenericEventContext, value: number) => void = () => {}) {
        super(0, [], false);
    }
}
