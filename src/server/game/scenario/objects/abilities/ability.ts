import type { EvaluationContext } from '../../evaluation-context';
import type { AttributeMap }      from '../attributes/i-attribute-holder';
import type { IAttributeHolder }  from '../attributes/sources/attribute-holder';
import type { Descriptor }        from '../common/descriptor';
import type { Condition }         from '../conditions/condition';
import type { Ship }              from '../ship';
import type { AbilityActions }    from './events/base-ability-events';
import type { AbilityInfo }       from 'shared/network/scenario/ability-info';

/**
 * Ability - Server Version
 *
 * Base class for abilities of a ship which execute actions upon use
 */
export abstract class Ability implements IAttributeHolder {

    protected usable: boolean | undefined;

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
     * Checks whether or not this ability is usable
     *
     * @param    evaluationContext Context for resolving objects and values during evaluation
     * @returns                    Whether or not this ability is usable
     */
    public checkUsable(evaluationContext: EvaluationContext): boolean {
        this.usable = this.condition.check(evaluationContext);
        return this.usable;
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public abstract use(evaluationContext: EvaluationContext): void;

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created AbilityInfo object
     */
    public abstract makeTransportable(): AbilityInfo;
}

/**
 * Abstract subclasses for grouping abilities into two types
 *
 * Allows inheriting classes to be determined as instances of one of these abstract classes
 */
export abstract class IndexedAbility extends Ability {}
export abstract class PositionedAbility extends Ability {}
