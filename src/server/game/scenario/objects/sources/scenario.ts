import Joi                         from 'joi';
import { turnOrderings }           from '../../turn-manager';
import { attributeHolderSchema }   from '../attributes/sources/attribute-holder';
import { descriptorSchema }        from '../common/sources/descriptor';
import { genericNameSchema }       from '../common/sources/generic-name';
import type { TurnOrdering }       from '../../turn-manager';
import type { AttributeMapSource } from '../attributes/i-attribute-holder';
import type { IDescriptorSource }  from '../common/sources/descriptor';

/**
 * JSON source interface reflecting schema
 */
export interface IScenarioSource {
    author: string,
    descriptor: IDescriptorSource,
    teams: string[],
    turnOrdering: TurnOrdering,
    maxTurnTime: number,
    attributes: AttributeMapSource
}

/**
 * Schema for validating source JSON data
 */
export const scenarioSchema = Joi.object({
    author: Joi.string().required(),
    descriptor: descriptorSchema.required(),
    teams: Joi.array().items(genericNameSchema).min(2).max(8).required(),
    turnOrdering: Joi.valid(...turnOrderings).required(),
    maxTurnTime: Joi.number().integer().min(5)
}).concat(attributeHolderSchema);
