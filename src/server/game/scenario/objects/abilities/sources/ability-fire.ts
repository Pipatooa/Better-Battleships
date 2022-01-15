import Joi                         from 'joi';
import { actionSchema }            from '../../actions/sources/action';
import { patternSchema }           from '../../common/sources/pattern';
import { abilityFireEventInfo }    from '../events/ability-fire-events';
import { baseAbilitySchema }       from './base-ability';
import type { ActionSource }       from '../../actions/sources/action';
import type { IPatternSource }     from '../../common/sources/pattern';
import type { AbilityFireEvent }   from '../events/ability-fire-events';
import type { IBaseAbilitySource } from './base-ability';

/**
 * JSON source interface reflecting schema
 */
export interface IAbilityFireSource extends IBaseAbilitySource {
    type: 'fire',
    selectionPattern: IPatternSource,
    effectPattern: IPatternSource,
    actions: { [event in AbilityFireEvent]: ActionSource[] }
}

/**
 * Schema for validating source JSON data
 */
export const abilityFireSchema = baseAbilitySchema.keys({
    type: 'fire',
    selectionPattern: patternSchema.required(),
    effectPattern: patternSchema.required(),
    actions: Joi.object().pattern(Joi.valid(...Object.keys(abilityFireEventInfo)), Joi.array().items(actionSchema.keys({
        priority: Joi.number().required()
    }))).required()
});
