import Joi                             from 'joi';
import { baseEventInfo }               from '../../events/base-events';
import { turnOrderings }               from '../../turn-manager';
import { actionSchema }                from '../actions/sources/action';
import { attributeHolderSchema }       from '../attributes/sources/attribute-holder';
import { descriptorSchema }            from '../common/sources/descriptor';
import { genericNameSchema }           from '../common/sources/generic-name';
import type { BaseEvent }              from '../../events/base-events';
import type { TurnOrdering }           from '../../turn-manager';
import type { ActionSource }           from '../actions/sources/action';
import type { IAttributeHolderSource } from '../attributes/sources/attribute-holder';
import type { IDescriptorSource }      from '../common/sources/descriptor';

/**
 * JSON source interface reflecting schema
 */
export interface IScenarioSource extends IAttributeHolderSource {
    author: string,
    descriptor: IDescriptorSource,
    teams: string[],
    turnOrdering: TurnOrdering,
    maxTurnTime: number,
    actions: { [event in BaseEvent]: ActionSource[] }
}

/**
 * Schema for validating source JSON data
 */
export const scenarioSchema = Joi.object({
    author: Joi.string().required(),
    descriptor: descriptorSchema.required(),
    teams: Joi.array().items(genericNameSchema).min(2).max(8).required(),
    turnOrdering: Joi.valid(...turnOrderings).required(),
    maxTurnTime: Joi.number().integer().min(5),
    actions: Joi.object().pattern(Joi.valid(...Object.keys(baseEventInfo)), Joi.array().items(actionSchema.keys({
        priority: Joi.number().required()
    }))).required()
}).concat(attributeHolderSchema);
