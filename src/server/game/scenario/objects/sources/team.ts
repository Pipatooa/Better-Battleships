import Joi                             from 'joi';
import { actionSchema }                from '../actions/sources/action';
import { attributeHolderSchema }       from '../attributes/sources/attribute-holder';
import { colorSchema }                 from '../common/sources/color';
import { descriptorSchema }            from '../common/sources/descriptor';
import { genericNameSchema }           from '../common/sources/generic-name';
import { teamEventInfo }               from '../events/team-events';
import type { ActionSource }           from '../actions/sources/action';
import type { IAttributeHolderSource } from '../attributes/sources/attribute-holder';
import type { IDescriptorSource }      from '../common/sources/descriptor';
import type { TeamEvent }              from '../events/team-events';

/**
 * JSON source interface reflecting schema
 */
export interface ITeamSource extends IAttributeHolderSource {
    descriptor: IDescriptorSource,
    color: string,
    highlightColor: string,
    playerConfigs: IPlayerConfig[][],
    actions: { [event in TeamEvent]: ActionSource[] }
}

/**
 * JSON source interface reflecting sub-schema
 */
export interface IPlayerConfig {
    playerPrototype: string,
    spawnRegion: string,
    color: string,
    highlightColor: string
}

/**
 * Schema for validating source JSON data
 */
export const teamSchema = Joi.object({
    descriptor: descriptorSchema.required(),
    color: colorSchema.required(),
    highlightColor: colorSchema.required(),
    playerConfigs: Joi.array().items(Joi.array().items(Joi.object({
        playerPrototype: genericNameSchema.required(),
        spawnRegion: genericNameSchema.required(),
        color: colorSchema.required(),
        highlightColor: colorSchema.required()
    })).min(1)).min(1).max(8).required(),
    actions: Joi.object().pattern(Joi.valid(...Object.keys(teamEventInfo)), Joi.array().items(actionSchema)).required()
}).concat(attributeHolderSchema);
