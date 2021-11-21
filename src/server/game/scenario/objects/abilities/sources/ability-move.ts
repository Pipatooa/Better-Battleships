import { patternSchema }           from '../../common/sources/pattern';
import { baseAbilitySchema }       from './base-ability';
import type { IPatternSource }     from '../../common/sources/pattern';
import type { IBaseAbilitySource } from './base-ability';

/**
 * JSON source interface reflecting schema
 */
export interface IAbilityMoveSource extends IBaseAbilitySource {
    type: 'move',
    pattern: IPatternSource
}

/**
 * Schema for validating source JSON data
 */
export const abilityMoveSchema = baseAbilitySchema.keys({
    type: 'move',
    pattern: patternSchema.required()
});
