import { checkAgainstSchema }                           from '../../schema-checker';
import { foreignAttributeRegistrySchema }               from './sources/foreign-attribute-registry';
import type { ParsingContext }                          from '../../parsing-context';
import type { AttributeReferenceForeignObjectSelector } from './sources/attribute-reference';
import type { ForeignAttributeRegistrySource }          from './sources/foreign-attribute-registry';

/**
 * ForeignAttributeRegistry - Server Version
 *
 * Stores information about registered foreign attributes
 */
export class ForeignAttributeRegistry {

    /**
     * ForeignAttributeRegistry constructor
     *
     * @param  registeredAttributes Record of foreign object selectors to attribute names
     */
    public constructor(public readonly registeredAttributes: Record<AttributeReferenceForeignObjectSelector, readonly string[]>) {

    }

    /**
     * Factory function to generate ForeignAttributeRegistry from JSON scenario data
     *
     * @param    parsingContext                 Context for resolving scenario data
     * @param    foreignAttributeRegistrySource JSON data for ForeignAttributeRegistry
     * @param    checkSchema                    When true, validates source JSON data against schema
     * @returns                                 Created ForeignAttributeRegistry object
     */
    public static async fromSource(parsingContext: ParsingContext, foreignAttributeRegistrySource: ForeignAttributeRegistrySource, checkSchema: boolean): Promise<ForeignAttributeRegistry> {

        // Validate JSON data against schema
        if (checkSchema)
            foreignAttributeRegistrySource = await checkAgainstSchema(foreignAttributeRegistrySource, foreignAttributeRegistrySchema, parsingContext);

        // Return created ForeignAttributeRegistry object
        return new ForeignAttributeRegistry(foreignAttributeRegistrySource);
    }
}
