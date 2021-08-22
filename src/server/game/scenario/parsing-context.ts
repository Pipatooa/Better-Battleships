import {IZipEntry} from 'adm-zip';
import {FileJSON} from 'formidable';
import {Attribute} from './attributes/attribute';
import {AttributeReference, AttributeSelector} from './attributes/attribute-reference';
import {AttributeMap} from './attributes/i-attribute-holder';
import {UnpackingError, ZipEntryMap} from './unpacker';

/**
 * ParsingContext - Server Version
 *
 * Stores information required for resolving scenario data
 */
export class ParsingContext {

    /**
     * ParsingContext constructor
     * @param scenarioFile           Scenario file to use
     * @param _currentFile           Path to current file being parsed
     * @param _currentPath           JSON path to object within current file being evaluated
     * @param boardEntry             Zip entry for board.json
     * @param teamEntries            Zip entries for teams/team.json files
     * @param playerPrototypeEntries Zip entries for player/player.json files
     * @param shipEntries            Zip entries for ship/ship.json files
     * @param abilityEntries         Zip entries for abilities/ability.json files
     * @param scenarioAttributes     Dictionary of attributes belonging to current scenario
     * @param teamAttributes         Dictionary of attributes belonging to current team,
     * @param playerAttributes       Dictionary of attributes belonging to current player
     * @param shipAttributes         Dictionary of attributes belonging to current ship
     * @param abilityAttributes      Dictionary of attributes belonging to current ability
     */
    public constructor(public readonly scenarioFile: FileJSON,
                       protected _currentFile: string,
                       protected _currentPath: string,
                       public readonly boardEntry: IZipEntry,
                       public readonly teamEntries: ZipEntryMap,
                       public readonly playerPrototypeEntries: ZipEntryMap,
                       public readonly shipEntries: ZipEntryMap,
                       public readonly abilityEntries: ZipEntryMap,
                       protected scenarioAttributes?: AttributeMap,
                       protected teamAttributes?: AttributeMap,
                       protected playerAttributes?: AttributeMap,
                       protected shipAttributes?: AttributeMap,
                       protected abilityAttributes?: AttributeMap) {
    }

    /**
     * Finds an attribute defined within this current parsing context
     * @param attributeReference Attribute path to locate attribute
     * @returns attribute     -- Found attribute
     */
    public getAttribute(attributeReference: AttributeReference): Attribute {

        let selectorStr: string;
        let attributeName: string;

        // Split attribute reference into selector part and name part
        [selectorStr, attributeName] = attributeReference.split('.');

        // Type declarations
        let attributeSelector = selectorStr as AttributeSelector;
        let attributeMap: AttributeMap | undefined;

        // Select attribute map depending on attribute selector
        switch (attributeSelector) {
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

        // If attribute map could not be found with selector, or attribute could not be found within the attribute map
        if (attributeMap === undefined || !(attributeName in attributeMap))
            throw new UnpackingError(`Could not find attribute '${attributeReference}' defined at '${this.currentPath}' in current context '${this.getAttributeContextName()}'`,
                this.currentFile);

        // Return found attribute
        return attributeMap[attributeName];
    }

    /**
     * Returns the lowest level of attribute currently known
     * @returns name -- Friendly name
     */
    public getAttributeContextName(): AttributeSelector {
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
     * @returns parsingContext -- Shallow copy of this parsing context
     */
    public getCopy(): ParsingContext {
        return new ParsingContext(
            this.scenarioFile,
            this._currentFile,
            this._currentPath,
            this.boardEntry,
            this.teamEntries,
            this.playerPrototypeEntries,
            this.shipEntries,
            this.abilityEntries,
            this.scenarioAttributes,
            this.teamAttributes,
            this.playerAttributes,
            this.shipAttributes,
            this.abilityAttributes);
    }

    /**
     * Factory function to generate a copy of this object with an updated current file
     *
     * Will also reset the current path
     * @param newFile             New filename to use in new context
     * @returns parsingContext -- Created ParsingContext
     */
    public withUpdatedFile(newFile: string): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy._currentFile = newFile;
        copy._currentPath = '';
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with an extended JSON object path
     * @param pathExtension       Extension to add to current path
     * @returns parsingContext -- Created ParsingContext
     */
    public withExtendedPath(pathExtension: string): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy._currentPath += pathExtension;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of scenario attributes
     * @param scenarioAttributes  Scenario attributes to use
     * @returns parsingContext -- Created ParsingContext
     */
    public withScenarioAttributes(scenarioAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.scenarioAttributes = scenarioAttributes;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of team attributes
     * @param teamAttributes      Team attributes to use
     * @returns parsingContext -- Created ParsingContext
     */
    public withTeamAttributes(teamAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.teamAttributes = teamAttributes;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of player attributes
     * @param playerAttributes    Player attributes to use
     * @returns parsingContext -- Created ParsingContext
     */
    public withPlayerAttributes(playerAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.playerAttributes = playerAttributes;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of ship attributes
     * @param shipAttributes    Ship attributes to use
     * @returns parsingContext -- Created ParsingContext
     */
    public withShipAttributes(shipAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.shipAttributes = shipAttributes;
        return copy;
    }

    /**
     * Factory function to generate a copy of this object with a set of ability attributes
     * @param abilityAttributes   Ability attributes to use
     * @returns parsingContext -- Created ParsingContext
     */
    public withAbilityAttributes(abilityAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.abilityAttributes = abilityAttributes;
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
}
