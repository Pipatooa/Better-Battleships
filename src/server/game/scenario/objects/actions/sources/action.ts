import Joi                                from 'joi';
import { attributeReferenceSchema }       from '../../attribute-references/sources/attribute-reference';
import { valueSchema }                    from '../../values/sources/value';
import { baseActionSchema }               from './base-action';
import type { IActionAdvanceTurnSource }  from './action-advance-turn';
import type { IActionLoseSource }         from './action-lose';
import type { IActionSetAttributeSource } from './action-set-attribute';
import type { IActionWinSource }          from './action-win';

/**
 * Type matching all action sources
 */
export type ActionSource =
    IActionSetAttributeSource |
    IActionAdvanceTurnSource |
    IActionWinSource |
    IActionLoseSource;

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all actions
 */
export const actionSchema = baseActionSchema.keys({
    type: Joi.valid('setAttribute', 'advanceTurn', 'win', 'lose'),
    attribute: attributeReferenceSchema.when('type',
        { is: 'setAttribute', then: Joi.required(), otherwise: Joi.forbidden() }),
    value: valueSchema.when('type',
        { is: 'setAttribute', then: Joi.required(), otherwise: Joi.forbidden() })
});
