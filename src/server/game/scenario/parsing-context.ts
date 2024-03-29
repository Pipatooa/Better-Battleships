import type { EventInfoEntry }                   from './events/base-events';
import type { ForeignAttributeRegistry }         from './objects/attribute-references/foreign-attribute-registry';
import type { AttributeReferenceObjectSelector } from './objects/attribute-references/sources/attribute-reference';
import type { AttributeMap }                     from './objects/attributes/i-attribute-holder';
import type { Board }                            from './objects/board';
import type { Player }                           from './objects/player';
import type { Scenario }                         from './objects/scenario';
import type { Ship }                             from './objects/ship';
import type { Team }                             from './objects/team';
import type { TurnManager }                      from './turn-manager';
import type { ZipEntryMap }                      from './unpacker';
import type { IZipEntry }                        from 'adm-zip';
import type { FileJSON }                         from 'formidable';

/**
 * ParsingContext - Server Version
 *
 * Stores information required for resolving scenario data
 */
export class ParsingContext {

    public readonly scenarioFileExtension: '.json' | '.yaml';

    private readonly fileStack: string[] = [];
    private readonly pathSegmentStack: string[] = [];

    public scenarioPartial: Partial<Scenario> | undefined;
    public turnManagerPartial: Partial<TurnManager> | undefined;
    public boardPartial: Partial<Board> | undefined;
    public teamPartial: Partial<Team> | undefined;
    public playerPartial: Partial<Player> | undefined;
    public shipPartial: Partial<Ship> | undefined;

    public readonly localAttributes = {} as Record<AttributeReferenceObjectSelector, [AttributeMap, AttributeMap] | undefined>;
    public foreignAttributeRegistry: ForeignAttributeRegistry | undefined;
    public currentEventInfo: EventInfoEntry | undefined;

    /**
     * ParsingContext constructor
     *
     * @param  scenarioFile                  Scenario file to use
     * @param  scenarioFormat                Format of scenario files
     * @param  boardEntry                    Zip entry for board.json
     * @param  foreignAttributeRegistryEntry Zip entry for foreign-attributes.json
     * @param  teamEntries                   Zip entries for teams/team.json files
     * @param  playerPrototypeEntries        Zip entries for player/player.json files
     * @param  shipEntries                   Zip entries for ship/ship.json files
     * @param  abilityEntries                Zip entries for abilities/ability.json files
     */
    public constructor(public readonly scenarioFile: FileJSON,
                       public readonly scenarioFormat: 'JSON' | 'YAML',
                       public readonly boardEntry: IZipEntry,
                       public readonly foreignAttributeRegistryEntry: IZipEntry,
                       public readonly teamEntries: ZipEntryMap,
                       public readonly playerPrototypeEntries: ZipEntryMap,
                       public readonly shipEntries: ZipEntryMap,
                       public readonly abilityEntries: ZipEntryMap) {

        this.scenarioFileExtension = `.${this.scenarioFormat.toLowerCase()}` as '.json' | '.yaml';
    }

    public withFile(file: string): this {
        this.fileStack.push(file);
        return this;
    }

    public reduceFileStack(): void {
        this.fileStack.pop();
    }

    public withExtendedPath(pathSegment: string): this {
        this.pathSegmentStack.push(pathSegment);
        return this;
    }

    public reducePath(): void {
        this.pathSegmentStack.pop();
    }

    /**
     * Getters and setters
     */

    public get currentFile(): string {
        return this.fileStack[this.fileStack.length - 1];
    }

    public get currentPath(): string {
        return this.pathSegmentStack.join('').replace(/^\./, '');
    }

    public get currentPathPrefix(): string {
        return this.pathSegmentStack.length === 0
            ? ''
            : this.pathSegmentStack.join('') + '.';
    }

    public get attributeContextName(): AttributeReferenceObjectSelector {
        if (this.localAttributes.ability !== undefined)
            return 'ability';
        if (this.localAttributes.ship !== undefined)
            return 'ship';
        if (this.localAttributes.player !== undefined)
            return 'player';
        if (this.localAttributes.team !== undefined)
            return 'team';
        return 'scenario';
    }
}
