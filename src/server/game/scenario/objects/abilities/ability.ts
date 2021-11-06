import type { AttributeMap } from '../attributes/i-attribute-holder';
import type { IAttributeHolder } from '../attributes/sources/attribute-holder';
import type { Descriptor } from '../common/descriptor';
import type { Condition } from '../conditions/condition';
import type { EvaluationContext } from '../../evaluation-context';
import type { Ship } from '../ship';
import type { AbilityActions } from './events/base-ability-events';

/**
 * Ability - Server Version
 *
 * Base class for abilities of a ship which execute actions upon use
 */
export abstract class Ability implements IAttributeHolder {

    /**
     * Ability constructor
     *
     * @param  ship       Parent ship which this ability belongs to
     * @param  descriptor Descriptor for ability
     * @param  condition  Condition which must hold true to be able to use this ability
     * @param  actions    Actions to execute when events are triggered
     * @param  attributes Attributes for the ability
     */
    public constructor(public readonly ship: Ship,
                       public readonly descriptor: Descriptor,
                       public readonly condition: Condition,
                       public readonly actions: AbilityActions,
                       public readonly attributes: AttributeMap) {
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     */
    public abstract use(usageContext: EvaluationContext): void;
}

/**
 * Abstract subclasses for grouping abilities into two types
 *
 * Allows inheriting classes to be determined as instances of one of these abstract classes
 */
export abstract class IndexedAbility extends Ability {}
export abstract class PositionedAbility extends Ability {}
