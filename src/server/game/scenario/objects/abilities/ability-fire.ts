import { checkAgainstSchema }      from '../../schema-checker';
import { getActions }              from '../actions/action-getter';
import { getAttributes }           from '../attributes/attribute-getter';
import { Descriptor }              from '../common/descriptor';
import { Pattern }                 from '../common/pattern';
import { buildCondition }          from '../conditions/condition-builder';
import { PositionedAbility }       from './ability';
import { fireAbilityEvents }       from './events/fire-ability-event';
import { abilityFireSchema }       from './sources/ability-fire';
import type { EvaluationContext }  from '../../evaluation-context';
import type { ParsingContext }     from '../../parsing-context';
import type { AttributeMap }       from '../attributes/i-attribute-holder';
import type { Condition }          from '../conditions/condition';
import type { Ship }               from '../ship';
import type { FireAbilityActions } from './events/fire-ability-event';
import type { IAbilityFireSource } from './sources/ability-fire';
import type { AbilityInfo }        from 'shared/network/scenario/ability-info';

/**
 * AbilityFire - Server Version
 *
 * Ability which acts upon a selected group of cells upon its use
 */
export class AbilityFire extends PositionedAbility {

    /**
     * AbilityFire constructor
     *
     * @param  ship                       Parent ship which this ability belongs to
     * @param  descriptor                 Descriptor for ability
     * @param  selectionPattern           Pattern determining which cell can be selected to apply the affect pattern around
     * @param  effectPattern              Pattern determining which cells around the selected cell are affected
     * @param  displayEffectPatternValues Whether or not effect pattern values should be displayed to the client when using the ability
     * @param  condition                  Condition which must hold true to be able to use this action
     * @param  actions                    Actions to execute when events are triggered
     * @param  attributes                 Attributes for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       public readonly selectionPattern: Pattern,
                       public readonly effectPattern: Pattern,
                       public readonly displayEffectPatternValues: boolean,
                       condition: Condition,
                       actions: FireAbilityActions,
                       attributes: AttributeMap) {
        super(ship, descriptor, condition, actions, attributes);
    }

    /**
     * Factory function to generate AbilityFire from JSON scenario data
     *
     * @param    parsingContext    Context for resolving scenario data
     * @param    abilityFireSource JSON data for AbilityFire
     * @param    checkSchema       When true, validates source JSON data against schema
     * @returns                    Created AbilityFire object
     */
    public static async fromSource(parsingContext: ParsingContext, abilityFireSource: IAbilityFireSource, checkSchema: boolean): Promise<AbilityFire> {

        // Validate JSON data against schema
        if (checkSchema)
            abilityFireSource = await checkAgainstSchema(abilityFireSource, abilityFireSchema, parsingContext);

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), abilityFireSource.attributes, 'ability');
        parsingContext.abilityAttributes = attributes;
        parsingContext.reducePath();

        // Get component elements from source
        const descriptor: Descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), abilityFireSource.descriptor, false);
        parsingContext.reducePath();
        const selectionPattern: Pattern = await Pattern.fromSource(parsingContext.withExtendedPath('.selectionPattern'), abilityFireSource.selectionPattern, false);
        parsingContext.reducePath();
        const effectPattern: Pattern = await Pattern.fromSource(parsingContext.withExtendedPath('.effectPattern'), abilityFireSource.effectPattern, false);
        parsingContext.reducePath();
        const condition: Condition = await buildCondition(parsingContext.withExtendedPath('.condition'), abilityFireSource.condition, false);
        parsingContext.reducePath();
        const actions: FireAbilityActions = await getActions(parsingContext.withExtendedPath('.actions'), fireAbilityEvents, ['onHit'], abilityFireSource.actions);
        parsingContext.reducePath();

        // Return created AbilityFire object
        parsingContext.abilityAttributes = undefined;
        return new AbilityFire(parsingContext.shipPartial as Ship, descriptor, selectionPattern, effectPattern, abilityFireSource.displayEffectPatternValues, condition, actions, attributes);
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public use(evaluationContext: EvaluationContext): void {

        if (!this.usable!)
            return;

        // Check that the movement is allowed
        if (this.selectionPattern.query(evaluationContext.x!, evaluationContext.y!) === 0)
            return;

        this.ship.moveBy(evaluationContext.x!, evaluationContext.y!);
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created AbilityInfo object
     */
    public makeTransportable(): AbilityInfo {
        return {
            type: 'fire',
            descriptor: this.descriptor.makeTransportable(),
            selectionPattern: this.selectionPattern.makeTransportable(false),
            effectPattern: this.effectPattern.makeTransportable(this.displayEffectPatternValues)
        };
    }
}
