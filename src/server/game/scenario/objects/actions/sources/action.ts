import Joi                                from 'joi';
import { attributeReferenceSchema }       from '../../attribute-references/sources/attribute-reference';
import { valueSchema }                    from '../../values/sources/value';
import { baseActionSchema }               from './base-action';
import type { IActionAdvanceTurnSource }  from './action-advance-turn';
import type { IActionDestroyShipSource }  from './action-destroy-ship';
import type { IActionDisplayMessage }     from './action-display-message';
import type { IActionLoseSource }         from './action-lose';
import type { IActionSetAttributeSource } from './action-set-attribute';
import type { IActionWinSource }          from './action-win';

/**
 * Type matching all action sources
 */
export type ActionSource =
    IActionSetAttributeSource |
    IActionAdvanceTurnSource |
    IActionDestroyShipSource |
    IActionWinSource |
    IActionLoseSource |
    IActionDisplayMessage;

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all actions
 */
export const actionSchema = baseActionSchema.keys({
    type: Joi.valid('setAttribute', 'advanceTurn', 'destroyShip', 'win', 'lose', 'displayMessage'),
    attribute: attributeReferenceSchema.when('type',
        { is: 'setAttribute', then: Joi.required(), otherwise: Joi.forbidden() }),
    value: valueSchema.when('type',
        { is: 'setAttribute', then: Joi.required(), otherwise: Joi.forbidden() }),
    ship: Joi.valid('local', 'foreign').when('type',
        { is: 'destroyShip', then: Joi.required(), otherwise: Joi.forbidden() }),
    team: Joi.valid('local', 'foreign').when('type',
        { is: 'win', then: Joi.required(), otherwise: Joi.forbidden() }),
    player: Joi.valid('local', 'foreign').when('type',
        { is: 'lose', then: Joi.required(), otherwise: Joi.forbidden() }),
    display: Joi.valid('message', 'popup').when('type',
        { is: 'displayMessage', then: Joi.required(), otherwise: Joi.forbidden() }),
    target: Joi.valid('local:team', 'local:player', 'foreign:team', 'foreign:player').when('type',
        { is: 'displayMessage', then: Joi.required(), otherwise: Joi.forbidden() }),
    message: Joi.string().when('type',
        { is: 'displayMessage', then: Joi.required(), otherwise: Joi.forbidden() })
});
