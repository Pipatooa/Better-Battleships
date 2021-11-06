import type { ParsingContext } from '../../parsing-context';
import { checkAgainstSchema } from '../../schema-checker';
import type { IForeignAttributeRegistrySource } from './sources/foreign-attribute-registry';
import { foreignAttributeRegistrySchema } from './sources/foreign-attribute-registry';

/**
 * ForeignAttributeRegistry - Server Version
 *
 * Stores information about registered foreign attributes
 */
export class ForeignAttributeRegistry {

    /**
     * ForeignAttributeRegistry constructor
     *
     * @param  foreignTeamAttributes   Registered foreign team attributes
     * @param  foreignPlayerAttributes Registered foreign player attributes
     * @param  foreignShipAttributes   Registered foreign ship attributes
     */
    public constructor(public readonly foreignTeamAttributes: string[],
                       public readonly foreignPlayerAttributes: string[],
                       public readonly foreignShipAttributes: string[]) {
    }

    /**
     * Returns a list of registered foreign attribute names for a specific type of attribute holder object
     *
     * @param    objectSelector Object selector string for specific attribute holder type
     * @returns                 List of registered foreign attribute names
     */
    public getRegisteredAttributeNames(objectSelector: 'team' | 'player' | 'ship'): string[] {
        switch (objectSelector) {
            case 'team':
                return this.foreignTeamAttributes;
            case 'player':
                return this.foreignPlayerAttributes;
            case 'ship':
                return this.foreignShipAttributes;
        }
    }
    
    /**
     * Factory function to generate ForeignAttributeRegistry from JSON scenario data
     *
     * @param    parsingContext                 Context for resolving scenario data
     * @param    foreignAttributeRegistrySource JSON data for ForeignAttributeRegistry
     * @param    checkSchema                    When true, validates source JSON data against schema
     * @returns                                 Created ForeignAttributeRegistry object
     */
    public static async fromSource(parsingContext: ParsingContext, foreignAttributeRegistrySource: IForeignAttributeRegistrySource, checkSchema: boolean): Promise<ForeignAttributeRegistry> {

        // Validate JSON data against schema
        if (checkSchema)
            foreignAttributeRegistrySource = await checkAgainstSchema(foreignAttributeRegistrySource, foreignAttributeRegistrySchema, parsingContext);
        
        // Return created ForeignAttributeRegistry object
        return new ForeignAttributeRegistry(foreignAttributeRegistrySource.team, foreignAttributeRegistrySource.player, foreignAttributeRegistrySource.ship);
    }
}
