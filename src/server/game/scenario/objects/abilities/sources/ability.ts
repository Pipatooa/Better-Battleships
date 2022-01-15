import Joi                            from 'joi';
import { actionSchema }               from '../../actions/sources/action';
import { attributeHolderSchema }      from '../../attributes/sources/attribute-holder';
import { patternSchema }              from '../../common/sources/pattern';
import { nullableConditionSchema }    from '../../conditions/sources/condition';
import { abilityEventInfo }           from '../events/ability-events';
import { abilityFireEventInfo }       from '../events/ability-fire-events';
import { baseAbilitySchema }          from './base-ability';
import type { IAbilityFireSource }    from './ability-fire';
import type { IAbilityGenericSource } from './ability-generic';
import type { IAbilityMoveSource }    from './ability-move';
import type { IAbilityRotateSource }  from './ability-rotate';

/**
 * Type matching all ability sources
 */
export type AbilitySource =
    IAbilityMoveSource |
    IAbilityRotateSource |
    IAbilityFireSource |
    IAbilityGenericSource;

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all abilities
 */
export const abilitySchema = baseAbilitySchema.keys({
    type: Joi.valid('move', 'rotate', 'fire', 'generic'),
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
        { is: 'fire', then: Joi.required(), otherwise: Joi.forbidden() }),
    buttonText: Joi.string().when('type',
        { is: 'generic', then: Joi.required(), otherwise: Joi.forbidden() }),
    condition: nullableConditionSchema.required(),
    actions: Joi.when('type',
        {
            is: 'fire',
            then: Joi.object().pattern(Joi.valid(...Object.keys(abilityFireEventInfo)), Joi.array().items(actionSchema.keys({
                priority: Joi.number().required()
            }))).required(),
            otherwise: Joi.object().pattern(Joi.valid(...Object.keys(abilityEventInfo)), Joi.array().items(actionSchema.keys({
                priority: Joi.number().required()
            }))).required()
        })
}).concat(attributeHolderSchema);
