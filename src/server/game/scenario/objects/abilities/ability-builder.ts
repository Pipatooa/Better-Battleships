import { checkAgainstSchema }  from '../../schema-checker';
import { AbilityFire }         from './ability-fire';
import { AbilityGeneric }      from './ability-generic';
import { AbilityMove }         from './ability-move';
import { AbilityRotate }       from './ability-rotate';
import { abilitySchema }       from './sources/ability';
import type { ParsingContext } from '../../parsing-context';
import type { Ability }        from './ability';
import type { AbilitySource }  from './sources/ability';

/**
 * Factory function to generate Ability from JSON scenario data
 *
 * @param    parsingContext Context for resolving scenario data
 * @param    abilitySource  JSON data for Ability
 * @param    checkSchema    When true, validates source JSON data against schema
 * @returns                 Created Ability object
 */
export async function buildAbility(parsingContext: ParsingContext, abilitySource: AbilitySource, checkSchema: boolean): Promise<Ability> {

    // Validate JSON data against schema
    if (checkSchema)
        abilitySource = await checkAgainstSchema(abilitySource, abilitySchema, parsingContext);

    // Call appropriate factory function based on ability type
    let ability: Ability;
    switch (abilitySource.type) {
        case 'move':
            ability = await AbilityMove.fromSource(parsingContext, abilitySource, false);
            break;
        case 'rotate':
            ability = await AbilityRotate.fromSource(parsingContext, abilitySource, false);
            break;
        case 'fire':
            ability = await AbilityFire.fromSource(parsingContext, abilitySource, false);
            break;
        case 'generic':
            ability = await AbilityGeneric.fromSource(parsingContext, abilitySource, false);
            break;
    }

    return ability;
}
