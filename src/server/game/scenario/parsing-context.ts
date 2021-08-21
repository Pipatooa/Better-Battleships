import AdmZip, {IZipEntry} from 'adm-zip';
import {FileJSON} from 'formidable';
import {Attribute} from './attributes/attribute';
import {AttributeReference, AttributeSelector} from './attributes/attribute-reference';
import {AttributeMap} from './attributes/i-attribute-holder';
import {UnpackingError, ZipEntryMap} from './unpacker';

export class ParsingContext {

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

    public getAttribute(parsingContext: ParsingContext, attributePath: AttributeReference): Attribute {
        let selectorStr: string;
        let attributeName: string;

        [selectorStr, attributeName] = attributePath.split('.');

        let attributeSelector: 'scenario' | 'team' | 'player' | 'ship' | 'ability' = selectorStr as AttributeSelector;
        let attributeMap: AttributeMap | undefined;

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

        if (attributeMap === undefined || !(attributeName in attributeMap))
            throw new UnpackingError(`Could not find attribute '${attributePath}' defined at '${parsingContext.currentPath}' in current context '${this.getContextName()}'`,
                parsingContext.currentFile);

        return attributeMap[attributeName];
    }

    public getContextName(): AttributeSelector {
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

    public withUpdatedFile(newFile: string): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy._currentFile = newFile;
        copy._currentPath = '';
        return copy;
    }

    public withExtendedPath(pathExtension: string): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy._currentPath += pathExtension;
        return copy;
    }

    public withScenarioAttributes(scenarioAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.scenarioAttributes = scenarioAttributes;
        return copy;
    }

    public withTeamAttributes(teamAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.teamAttributes = teamAttributes;
        return copy;
    }

    public withPlayerAttributes(playerAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.playerAttributes = playerAttributes;
        return copy;
    }

    public withShipAttributes(shipAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.shipAttributes = shipAttributes;
        return copy;
    }

    public withAbilityAttributes(abilityAttributes: AttributeMap): ParsingContext {
        let copy: ParsingContext = this.getCopy();
        copy.abilityAttributes = abilityAttributes;
        return copy;
    }

    // Getters and setters
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
