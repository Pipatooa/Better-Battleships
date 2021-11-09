import Joi from 'joi';
import type { ActionSource } from '../../actions/sources/action';
import { actionSchema } from '../../actions/sources/action';
import type { IPatternSource } from '../../common/sources/pattern';
import { patternSchema } from '../../common/sources/pattern';
import type { FireAbilityEvent } from '../events/fire-ability-event';
import { fireAbilityEvents } from '../events/fire-ability-event';
import type { IBaseAbilitySource } from './base-ability';
import { baseAbilitySchema } from './base-ability';

/**
 * JSON source interface reflecting schema
 */
export interface IAbilityFireSource extends IBaseAbilitySource {
    type: 'fire',
    selectionPattern: IPatternSource,
    effectPattern: IPatternSource,
    displayEffectPatternValues: boolean,
    actions: { [event in FireAbilityEvent]: ActionSource[] }
}

/**
 * Schema for validating source JSON data
 */
export const abilityFireSchema = baseAbilitySchema.keys({
    type: 'fire',
    selectionPattern: patternSchema.required(),
    effectPattern: patternSchema.required(),
    displayEffectPatternValues: Joi.boolean().required(),
    actions: Joi.object().pattern(Joi.valid(...fireAbilityEvents), Joi.array().items(actionSchema)).required()
});
