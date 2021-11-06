import Joi from 'joi';
import { actionSchema } from '../../actions/sources/action';
import { attributeHolderSchema } from '../../attributes/sources/attribute-holder';
import { patternSchema } from '../../common/sources/pattern';
import { conditionSchema } from '../../conditions/sources/condition';
import { baseAbilityEvents } from '../events/base-ability-events';
import { fireAbilityEvents } from '../events/fire-ability-event';
import { baseAbilitySchema } from './base-ability';
import type { IAbilityFireSource } from './ability-fire';
import type { IAbilityMoveSource } from './ability-move';
import type { IAbilityRotateSource } from './ability-rotate';

/**
 * Type matching all ability sources
 */
export type AbilitySource =
    IAbilityMoveSource |
    IAbilityRotateSource |
    IAbilityFireSource;

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
            then: Joi.object().pattern(Joi.valid(...fireAbilityEvents), Joi.array().items(actionSchema)).required(),
            otherwise: Joi.object().pattern(Joi.valid(...baseAbilityEvents), Joi.array().items(actionSchema)).required()
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
