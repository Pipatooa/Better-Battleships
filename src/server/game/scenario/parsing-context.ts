import { AttributeReferenceForeign }             from './objects/attribute-references/attribute-reference-foreign';
import { AttributeReferenceLocal }               from './objects/attribute-references/attribute-reference-local';
import { UnpackingError }                        from './unpacker';
import type { ForeignAttributeRegistry }         from './objects/attribute-references/foreign-attribute-registry';
import type { AttributeReferenceObjectSelector } from './objects/attribute-references/sources/attribute-reference';
import type { AttributeMap }                     from './objects/attributes/i-attribute-holder';
import type { Ship }                             from './objects/ship';
import type { ZipEntryMap }                      from './unpacker';
import type { IZipEntry }                        from 'adm-zip';
import type { FileJSON }                         from 'formidable';

/**
 * ParsingContext - Server Version
 *
 * Stores information required for resolving scenario data
 */
export class ParsingContext {

    /**
     * ParsingContext constructor
     *
     * @param  scenarioFile                  Scenario file to use
     * @param  _currentFile                  Path to current file being parsed
     * @param  _currentPath                  JSON path to object within current file being evaluated
     * @param  boardEntry                    Zip entry for board.json
     * @param  foreignAttributeRegistryEntry Zip entry for foreign-attributes.json
     * @param  teamEntries                   Zip entries for teams/team.json files
     * @param  playerPrototypeEntries        Zip entries for player/player.json files
     * @param  shipEntries                   Zip entries for ship/ship.json files
     * @param  abilityEntries                Zip entries for abilities/ability.json files
     * @param  scenarioAttributes            Dictionary of attributes belonging to current scenario
     * @param  teamAttributes                Dictionary of attributes belonging to current team,
     * @param  playerAttributes              Dictionary of attributes belonging to current player
     * @param  shipAttributes                Dictionary of attributes belonging to current ship
     * @param  abilityAttributes             Dictionary of attributes belonging to current ability
     * @param  _foreignAttributeRegistry     Registry of registered foreign attribute names
     * @param  _shipPartial                  Empty ship object which is yet to be constructed
     * @param  _foreignAttributeFlag         Whether or not to treat attribute references as foreign references
     */
    public constructor(public readonly scenarioFile: FileJSON,
                       protected _currentFile: string,
                       protected _currentPath: string,
                       public readonly boardEntry: IZipEntry,
                       public readonly foreignAttributeRegistryEntry: IZipEntry,
                       public readonly teamEntries: ZipEntryMap,
                       public readonly playerPrototypeEntries: ZipEntryMap,
                       public readonly shipEntries: ZipEntryMap,
                       public readonly abilityEntries: ZipEntryMap,
                       protected scenarioAttributes?: AttributeMap,
                       protected teamAttributes?: AttributeMap,
                       protected playerAttributes?: AttributeMap,
                       protected shipAttributes?: AttributeMap,
                       protected abilityAttributes?: AttributeMap,
                       protected _foreignAttributeRegistry?: ForeignAttributeRegistry,
                       protected _shipPartial?: Partial<Ship>,
                       protected _foreignAttributeFlag: boolean = false) {
    }

    /**
     * Returns a reference to an attribute defined within this current parsing context
     *
     * @param    objectSelector Object selector part of attribute reference string
     * @param    attributeName  Name of attribute
     * @returns                 Found attribute
     */
    public getLocalAttributeReference(objectSelector: AttributeReferenceObjectSelector, attributeName: string): AttributeReferenceLocal {

        let attributeMap: AttributeMap | undefined;

        // Select attribute knownItems depending on attribute selector
        switch (objectSelector) {
            case 'scenario':
                attributeMap = this.scenarioAttributes;
                break;
            case 'team':
                attributeMap = this.teamAttributes;
                break;
            case 'player':
                attributeMap = this.playerAttributes;
                break;
            case 'ship':
                attributeMap = this.shipAttributes;
                break;
            case 'ability':
                attributeMap = this.abilityAttributes;
                break;
        }

        // If attribute knownItems could not be found with selector, or attribute could not be found within the attribute knownItems
        if (attributeMap === undefined || !(attributeName in attributeMap))
            throw new UnpackingError(`Could not find attribute 'local:${objectSelector}.${attributeName}' defined at '${this.currentPath}' in current context '${this.getAttributeContextName()}'`,
                this.currentFile);

        // Return reference to found attribute
        return new AttributeReferenceLocal(attributeMap[attributeName]);
    }

    /**
     * Returns a reference to an attribute which exists on other objects depending on evaluation context
     *
     * @param    objectSelector Object selector part of attribute reference string
     * @param    attributeName  Name of attribute
     * @returns                 Whether or not the foreign attribute exists
     */
    public getForeignAttributeReference(objectSelector: 'team' | 'player' | 'ship', attributeName: string): AttributeReferenceForeign {

        if (!this._foreignAttributeFlag)
            throw new UnpackingError(`Cannot reference foreign attribute 'foreign:${objectSelector}.${attributeName}' defined at '${this.currentPath}' in a context where no foreign object to address exists`,
                this.currentFile);

        if (!this.foreignAttributeRegistry!.getRegisteredAttributeNames(objectSelector).includes(attributeName))
            throw new UnpackingError(`Cannot find attribute 'foreign:${objectSelector}.${attributeName}' defined at '${this.currentPath}' since it is not declared as a foreign attribute in 'foreign-attributes.json'`,
                this.currentFile);

        return new AttributeReferenceForeign(objectSelector, attributeName);
    }

    /**
     * Returns the lowest level of attribute currently known
     *
     * @returns  Object selector
     */
    public getAttributeContextName(): AttributeReferenceObjectSelector {
        if (this.abilityAttributes !== undefined)
            return 'ability';

        if (this.shipAttributes !== undefined)
            return 'ship';

        if (this.playerAttributes !== undefined)
            return 'player';

        if (this.teamAttributes !== undefined)
            return 'team';

        return 'scenario';
    }

    /**
     * Factory function to generate a copy of this object.
     *
     * @returns  Shallow copy of this parsing context
     */
    public getCopy(): ParsingContext {
        return new ParsingContext(
            this.scenarioFile,
            this._currentFile,
            this._currentPath,
            this.boardEntry,
            this.foreignAttributeRegistryEntry,
            this.teamEntries,
            this.playerPrototypeEntries,
            this.shipEntries,
            this.abilityEntries,
            this.scenarioAttributes,
            this.teamAttributes,
            this.playerAttributes,
            this.shipAttributes,
            this.abilityAttributes,
            this._foreignAttributeRegistry,
            this._shipPartial,
            this._foreignAttributeFlag);
    }

    /**
     * Factory function to generate a copy of this object with an updated current file
     *
     * Will also reset the current path
     *
     * @param    newFile New filename to use in new context
     * @returns          Created ParsingContext
     */
    public withUpdatedFile(newFile: string): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy._currentFile = newFile;
        copy._currentPath = '';
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with an extended JSON object path
     *
     * @param    pathExtension Extension to add to current path
     * @returns                Created ParsingContext
     */
    public withExtendedPath(pathExtension: string): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy._currentPath += pathExtension;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of scenario attributes
     *
     * @param    scenarioAttributes Scenario attributes to use
     * @returns                     Created ParsingContext
     */
    public withScenarioAttributes(scenarioAttributes: AttributeMap): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy.scenarioAttributes = scenarioAttributes;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of team attributes
     *
     * @param    teamAttributes Team attributes to use
     * @returns                 Created ParsingContext
     */
    public withTeamAttributes(teamAttributes: AttributeMap): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy.teamAttributes = teamAttributes;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of player attributes
     *
     * @param    playerAttributes Player attributes to use
     * @returns                   Created ParsingContext
     */
    public withPlayerAttributes(playerAttributes: AttributeMap): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy.playerAttributes = playerAttributes;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of ship attributes
     *
     * @param    shipAttributes Ship attributes to use
     * @returns                 Created ParsingContext
     */
    public withShipAttributes(shipAttributes: AttributeMap): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy.shipAttributes = shipAttributes;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of ability attributes
     *
     * @param    abilityAttributes Ability attributes to use
     * @returns                    Created ParsingContext
     */
    public withAbilityAttributes(abilityAttributes: AttributeMap): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy.abilityAttributes = abilityAttributes;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with foreign attribute registry
     *
     * @param    foreignAttributeRegistry Foreign attribute registry to include
     * @returns                           Created ParsingContext
     */
    public withForeignAttributeRegistry(foreignAttributeRegistry: ForeignAttributeRegistry): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy._foreignAttributeRegistry = foreignAttributeRegistry;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a reference to a ship
     *
     * @param    ship Empty ship object which is yet to be constructed
     * @returns       Created ParsingContext
     */
    public withShipReference(ship: Partial<Ship>): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy._shipPartial = ship;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with foreign attribute flag set to true
     *
     * @returns  Created ParsingContext
     */
    public withForeignAttributeFlag(): ParsingContext {
        const copy: ParsingContext = this.getCopy();
        copy._foreignAttributeFlag = true;
        return copy;
    }

    /**
     * Getters and setters
     */

    public get currentFile(): string {
        return this._currentFile;
    }

    public get currentPath(): string {
        return this._currentPath.replace(/^\./, '');
    }

    public get currentPathPrefix(): string {
        if (this._currentPath === '')
            return '';
        return this.currentPath + '.';
    }

    public get foreignAttributeRegistry(): ForeignAttributeRegistry | undefined {
        return this._foreignAttributeRegistry;
    }

    public get shipPartial(): Partial<Ship> | undefined {
        return this._shipPartial;
    }

    public get foreignAttributeFlag(): boolean {
        return this._foreignAttributeFlag;
    }
}
