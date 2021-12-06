import { AttributeReferenceForeign }             from './objects/attribute-references/attribute-reference-foreign';
import { AttributeReferenceLocal }               from './objects/attribute-references/attribute-reference-local';
import { UnpackingError }                        from './unpacker';
import type { ForeignAttributeRegistry }         from './objects/attribute-references/foreign-attribute-registry';
import type { AttributeReferenceObjectSelector } from './objects/attribute-references/sources/attribute-reference';
import type { AttributeMap }                     from './objects/attributes/i-attribute-holder';
import type { Board }                            from './objects/board';
import type { Player }                           from './objects/player';
import type { Ship }                             from './objects/ship';
import type { Team }                             from './objects/team';
import type { ZipEntryMap }                      from './unpacker';
import type { IZipEntry }                        from 'adm-zip';
import type { FileJSON }                         from 'formidable';

/**
 * ParsingContext - Server Version
 *
 * Stores information required for resolving scenario data
 */
export class ParsingContext {

    private readonly fileStack: string[] = [];
    private readonly pathSegments: string[] = [];

    public board: Board | undefined;
    public teamPartial: Partial<Team> | undefined;
    public playerPartial: Partial<Player> | undefined;
    public shipPartial: Partial<Ship> | undefined;

    public foreignAttributeRegistry: ForeignAttributeRegistry | undefined;
    public foreignAttributeFlag = false;

    public scenarioAttributes: AttributeMap | undefined;
    public teamAttributes: AttributeMap | undefined;
    public playerAttributes: AttributeMap | undefined;
    public shipAttributes: AttributeMap | undefined;
    public abilityAttributes: AttributeMap | undefined;

    /**
     * ParsingContext constructor
     *
     * @param  scenarioFile                  Scenario file to use
     * @param  boardEntry                    Zip entry for board.json
     * @param  foreignAttributeRegistryEntry Zip entry for foreign-attributes.json
     * @param  teamEntries                   Zip entries for teams/team.json files
     * @param  playerPrototypeEntries        Zip entries for player/player.json files
     * @param  shipEntries                   Zip entries for ship/ship.json files
     * @param  abilityEntries                Zip entries for abilities/ability.json files
     */
    public constructor(public readonly scenarioFile: FileJSON,
                       public readonly boardEntry: IZipEntry,
                       public readonly foreignAttributeRegistryEntry: IZipEntry,
                       public readonly teamEntries: ZipEntryMap,
                       public readonly playerPrototypeEntries: ZipEntryMap,
                       public readonly shipEntries: ZipEntryMap,
                       public readonly abilityEntries: ZipEntryMap) {

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

        // Select attribute map depending on attribute selector
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

        const attribute = attributeMap?.[attributeName];
        if (attribute === undefined)
            throw new UnpackingError(`Could not find attribute 'local:${objectSelector}.${attributeName}' defined at '${this.currentPath}' in current context '${this.attributeContextName}'`,
                this.currentFile);

        return new AttributeReferenceLocal(attribute);
    }

    /**
     * Returns a reference to an attribute which exists on other objects depending on evaluation context
     *
     * @param    objectSelector Object selector part of attribute reference string
     * @param    attributeName  Name of attribute
     * @returns                 Whether or not the foreign attribute exists
     */
    public getForeignAttributeReference(objectSelector: 'team' | 'player' | 'ship', attributeName: string): AttributeReferenceForeign {

        if (!this.foreignAttributeFlag)
            throw new UnpackingError(`Cannot reference foreign attribute 'foreign:${objectSelector}.${attributeName}' defined at '${this.currentPath}' in a context where no foreign object to address exists`,
                this.currentFile);

        if (!this.foreignAttributeRegistry!.getRegisteredAttributeNames(objectSelector).includes(attributeName))
            throw new UnpackingError(`Cannot find attribute 'foreign:${objectSelector}.${attributeName}' defined at '${this.currentPath}' since it is not declared as a foreign attribute in 'foreign-attributes.json'`,
                this.currentFile);

        return new AttributeReferenceForeign(objectSelector, attributeName);
    }

    public withFile(file: string): this {
        this.fileStack.push(file);
        return this;
    }

    public reduceFileStack(): void {
        this.fileStack.pop();
    }

    public withExtendedPath(pathSegment: string): this {
        this.pathSegments.push(pathSegment);
        return this;
    }

    public reducePath(): void {
        if (this.pathSegments.length > 0)
            this.pathSegments.pop();
    }

    /**
     * Getters and setters
     */

    public get currentFile(): string {
        return this.fileStack[this.fileStack.length - 1];
    }

    public get currentPath(): string {
        return this.pathSegments.join('').replace(/^\./, '');
    }

    public get currentPathPrefix(): string {
        return this.pathSegments.length === 0
            ? ''
            : this.pathSegments.join('') + '.';
    }

    public get attributeContextName(): AttributeReferenceObjectSelector {
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
}
