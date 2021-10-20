import Joi from 'joi';
import { getActions } from '../actions/action-getter';
import { getAttributes } from '../attributes/attribute-getter';
import { AttributeMap } from '../attributes/i-attribute-holder';
import { Descriptor } from '../common/descriptor';
import { Rotation } from '../common/rotation';
import { Condition } from '../conditions/condition';
import { buildCondition } from '../conditions/condition-builder';
import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { Ship } from '../ship';
import { Ability, AbilityActions, abilityEvents, baseAbilitySchema, IBaseAbilitySource } from './ability';
import { EvaluationContext } from '../evaluation-context';

/**
 * AbilityRotate - Server Version
 *
 * Ability which rotates a ship upon its use
 */
export class AbilityRotate extends Ability {
    
    /**
     * AbilityRotate constructor
     *
     * @param  ship          Parent ship which this ability belongs to
     * @param  descriptor    Descriptor for ability
     * @param  rot90allowed  Whether or not a rotation by 90 degrees is allowed
     * @param  rot180allowed Whether or not a rotation by 180 degrees is allowed
     * @param  rot270allowed Whether or not a rotation by 270 degrees is allowed 
     * @param  condition     Condition which must hold true to be able to use this action
     * @param  actions       Actions to execute when events are triggered
     * @param  attributes    Attributes for the ability
     */
    public constructor(ship: Ship,
                       descriptor: Descriptor,
                       public readonly rot90allowed: boolean,
                       public readonly rot180allowed: boolean,
                       public readonly rot270allowed: boolean,
                       condition: Condition,
                       actions: AbilityActions,
                       attributes: AttributeMap) {
        super(ship, descriptor, condition, actions, attributes);
    }


    /**
     * Factory function to generate AbilityRotate from JSON scenario data
     *
     * @param    parsingContext        Context for resolving scenario data
     * @param    rotationAbilitySource JSON data for AbilityRotate
     * @param    checkSchema           When true, validates source JSON data against schema
     * @returns                        Created AbilityRotate object
     */
    public static async fromSource(parsingContext: ParsingContext, rotationAbilitySource: IRotationAbilitySource, checkSchema: boolean): Promise<AbilityRotate> {

        // Validate JSON data against schema
        if (checkSchema)
            rotationAbilitySource = await checkAgainstSchema(rotationAbilitySource, rotationAbilitySchema, parsingContext);

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), rotationAbilitySource.attributes, 'ability');
        parsingContext = parsingContext.withAbilityAttributes(attributes);

        // Get component elements from source
        const descriptor: Descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), rotationAbilitySource.descriptor, false);
        const condition: Condition = await buildCondition(parsingContext.withExtendedPath('.condition'), rotationAbilitySource.condition, false);
        const actions: AbilityActions = await getActions(parsingContext.withExtendedPath('.actions'), abilityEvents, [], rotationAbilitySource.actions);

        // Return created AbilityRotate object
        return new AbilityRotate(parsingContext.shipPartial as Ship, descriptor, rotationAbilitySource.rot90, rotationAbilitySource.rot180, rotationAbilitySource.rot270, condition, actions, attributes);
    }

    /**
     * Execute actions related to this ability if the ability's condition is met
     *
     * @param  evaluationContext Context for resolving objects and values during evaluation
     */
    public use(evaluationContext: EvaluationContext): void {

        if (!this.condition.check(evaluationContext))
            return;

        if (evaluationContext.index === 0 && this.rot90allowed) this.ship.rotate(Rotation.Clockwise90);
        else if (evaluationContext.index === 1 && this.rot180allowed) this.ship.rotate(Rotation.Clockwise180);
        else if (evaluationContext.index === 2 && this.rot270allowed) this.ship.rotate(Rotation.Clockwise270);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IRotationAbilitySource extends IBaseAbilitySource {
    type: 'rotate',
    rot90: boolean,
    rot180: boolean,
    rot270: boolean
}

/**
 * Schema for validating source JSON data
 */
export const rotationAbilitySchema = baseAbilitySchema.keys({
    type: 'rotate',
    rot90: Joi.boolean().required(),
    rot180: Joi.boolean().required(),
    rot270: Joi.boolean().required()
});
