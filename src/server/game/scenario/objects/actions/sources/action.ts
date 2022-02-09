import Joi                                  from 'joi';
import { attributeReferenceSchema }         from '../../attribute-references/sources/attribute-reference';
import { valueSchema }                      from '../../values/sources/value';
import { baseActionSchema }                 from './base-action';
import type { IActionAdvanceTurnSource }    from './action-advance-turn';
import type { IActionDestroyShipSource }    from './action-destroy-ship';
import type { IActionDisplayMessageSource } from './action-display-message';
import type { IActionLoseSource }           from './action-lose';
import type { IActionReplaceTileSource }    from './action-replace-tile';
import type { IActionSetAttributeSource }   from './action-set-attribute';
import type { IActionSetTileSource }        from './action-set-tile';
import type { IActionWinSource }            from './action-win';

/**
 * Type matching all action sources
 */
export type ActionSource =
    IActionSetAttributeSource |
    IActionAdvanceTurnSource |
    IActionDestroyShipSource |
    IActionWinSource |
    IActionLoseSource |
    IActionDisplayMessageSource |
    IActionSetTileSource |
    IActionReplaceTileSource;

/**
 * Full schema for validating source JSON data
 *
 * Able to verify all actions
 */
export const actionSchema = baseActionSchema.keys({
    type: Joi.valid('setAttribute', 'advanceTurn', 'destroyShip', 'win', 'lose', 'displayMessage', 'setTile', 'replaceTile'),
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
    target: Joi.valid('local:team', 'local:player', 'foreign:team', 'foreign:player', 'all').when('type',
        { is: 'displayMessage', then: Joi.required(), otherwise: Joi.forbidden() }),
    message: Joi.string().when('type',
        { is: 'displayMessage', then: Joi.required(), otherwise: Joi.forbidden() }),
    location: Joi.string().when('type',
        { is: 'setTile', then: Joi.required(), otherwise: Joi.forbidden() }),
    tile: Joi.string().length(1).when('type',
        { is: 'setTile', then: Joi.required(), otherwise: Joi.forbidden() }),
    oldTile: Joi.string().length(1).when('type',
        { is: 'replaceTile', then: Joi.required(), otherwise: Joi.forbidden() }),
    newTile: Joi.string().length(1).when('type',
        { is: 'replaceTile', then: Joi.required(), otherwise: Joi.forbidden() })
});
