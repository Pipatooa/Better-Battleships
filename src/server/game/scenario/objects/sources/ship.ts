import Joi                             from 'joi';
import { actionSchema }                from '../actions/sources/action';
import { attributeHolderSchema }       from '../attributes/sources/attribute-holder';
import { descriptorSchema }            from '../common/sources/descriptor';
import { genericNameSchema }           from '../common/sources/generic-name';
import { patternSchema }               from '../common/sources/pattern';
import { shipEventInfo }               from '../events/ship-events';
import type { ActionSource }           from '../actions/sources/action';
import type { IAttributeHolderSource } from '../attributes/sources/attribute-holder';
import type { IDescriptorSource }      from '../common/sources/descriptor';
import type { IPatternSource }         from '../common/sources/pattern';
import type { ShipEvent }              from '../events/ship-events';

/**
 * JSON source interface reflecting schema
 */
export interface IShipSource extends IAttributeHolderSource {
    descriptor: IDescriptorSource;
    pattern: IPatternSource;
    abilities: string[];
    visibility: number;
    actions: { [event in ShipEvent]: ActionSource[] }
}

/**
 * Schema for validating source JSON data
 */
export const shipSchema = Joi.object({
    descriptor: descriptorSchema.required(),
    pattern: patternSchema.required(),
    visibility: Joi.number().integer().min(1).required(),
    abilities: Joi.array().items(genericNameSchema).required(),
    actions: Joi.object().pattern(Joi.valid(...Object.keys(shipEventInfo)), Joi.array().items(actionSchema)).required()
}).concat(attributeHolderSchema);
