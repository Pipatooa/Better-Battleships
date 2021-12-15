import Joi                         from 'joi';
import { actionSchema }            from '../actions/sources/action';
import { attributeHolderSchema }   from '../attributes/sources/attribute-holder';
import { genericNameSchema }       from '../common/sources/generic-name';
import { playerEventInfo }         from '../events/player-events';
import type { ActionSource }       from '../actions/sources/action';
import type { AttributeMapSource } from '../attributes/i-attribute-holder';
import type { PlayerEvent }        from '../events/player-events';

/**
 * JSON source interface reflecting schema
 */
export interface IPlayerSource {
    ships: string[],
    actions: { [event in PlayerEvent]: ActionSource[] },
    attributes: AttributeMapSource
}

/**
 * Schema for validating source JSON data
 */
export const playerSchema = Joi.object({
    ships: Joi.array().items(genericNameSchema).min(1).required(),
    actions: Joi.object().pattern(Joi.valid(...Object.keys(playerEventInfo)), Joi.array().items(actionSchema)).required()
}).concat(attributeHolderSchema);
