import Joi from 'joi';
import { Action, actionSchema, IActionSource } from '../actions/action';
import {
    attributeHolderSchema,
    AttributeMap,
    AttributeMapSource,
    IAttributeHolder
} from '../attributes/i-attribute-holder';
import { Descriptor, descriptorSchema, IDescriptorSource } from '../common/descriptor';
import { patternSchema } from '../common/pattern';
import { Condition, conditionSchema, IConditionSource } from '../conditions/condition';
import { baseEvents } from '../events/base-events';
import { Ship } from '../ship';
import { IFireAbilitySource } from './ability-fire';
import { IMovementAbilitySource } from './ability-move';
import { IRotationAbilitySource } from './ability-rotate';
import { EvaluationContext } from '../evaluation-context';

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
 * List of event names for abilities
 */
export const abilityEvents = [
    ...baseEvents,
    'onUse'
] as const;

/**
 * Type matching all ability event name strings
 */
export type AbilityEvent = typeof abilityEvents[number];

/**
 * Type describing a dictionary of actions tied to ability event names
 */
export type AbilityActions = { [event in AbilityEvent]: Action[] };


/**
 * JSON source interface reflecting base ability schema
 */
export interface IBaseAbilitySource {
    descriptor: IDescriptorSource,
    condition: IConditionSource,
    actions: { [event in AbilityEvent]: IActionSource[] },
    attributes: AttributeMapSource
}

/**
 * JSON source interface reflecting full ability schema
 */
export type IAbilitySource =
    IMovementAbilitySource |
    IRotationAbilitySource |
    IFireAbilitySource;

/**
 * Base schema for validating source JSON data
 */
export const baseAbilitySchema = Joi.object({
    type: Joi.string().required(),
    descriptor: descriptorSchema.required(),
    condition: conditionSchema.required(),
    actions: Joi.object().pattern(Joi.valid(...abilityEvents), Joi.array().items(actionSchema)).required()
}).concat(attributeHolderSchema);

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all abilities
 */
export const abilitySchema = baseAbilitySchema.keys({
    type: Joi.valid('move', 'rotate', 'fire'),
    condition: conditionSchema.required(),
    actions: Joi.when('type',
        {
            is: 'fire',
            then: Joi.object().pattern(Joi.valid(...abilityEvents, 'onHit'), Joi.array().items(actionSchema)).required(),
            otherwise: Joi.object().pattern(Joi.valid(...abilityEvents), Joi.array().items(actionSchema)).required()
        }),
    pattern: patternSchema.when('type',
        { is: 'move', then: Joi.required(), otherwise: Joi.forbidden() }),
    rot90: Joi.boolean().when('type',
        { is: 'rotate', then: Joi.required(), otherwise: Joi.forbidden() }),
    rot180: Joi.boolean().when('type',
        { is: 'rotate', then: Joi.required(), otherwise: Joi.forbidden() }),
    rot270: Joi.boolean().when('type',
        { is: 'rotate', then: Joi.required(), otherwise: Joi.forbidden() }),
    selectionPattern: patternSchema.when('type',
        { is: 'fire', then: Joi.required(), otherwise: Joi.forbidden() }),
    effectPattern: patternSchema.when('type',
        { is: 'fire', then: Joi.required(), otherwise: Joi.forbidden() })
}).concat(attributeHolderSchema);
