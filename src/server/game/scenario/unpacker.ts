import AdmZip, { IZipEntry } from 'adm-zip';
import { FileJSON } from 'formidable';
import Joi from 'joi';
import { ParsingContext } from './parsing-context';
import { IScenarioSource, Scenario } from './scenario';

export type ZipEntryMap = { [name: string]: IZipEntry };

/**
 * Unpacks a zip file into a scenario object asynchronously
 *
 * @param    fileJSON Scenario file information
 * @returns           Scenario object
 */
export async function unpack(fileJSON: FileJSON): Promise<Scenario> {

    // Read scenario zip file
    const scenarioZip = new AdmZip(fileJSON.path);

    // Get a list of all zip entries
    const zipEntries: AdmZip.IZipEntry[] = scenarioZip.getEntries();

    // Get entries for named objects
    const abilityEntries: ZipEntryMap = {};
    const shipEntries: ZipEntryMap = {};
    const playerPrototypeEntries: ZipEntryMap = {};
    const teamEntries: ZipEntryMap = {};

    for (const entry of zipEntries) {

        // Check entry regex
        const result: RegExpExecArray | null = /^(abilities|ships|players|teams)\/([a-zA-Z\-_\d]+).json$/.exec(entry.entryName);
        if (result === null)
            continue;

        // Put entry in correct array of entries
        switch (result[1]) {
            case 'abilities':
                abilityEntries[result[2]] = entry;
                break;
            case 'ships':
                shipEntries[result[2]] = entry;
                break;
            case 'players':
                playerPrototypeEntries[result[2]] = entry;
                break;
            case 'teams':
                teamEntries[result[2]] = entry;
                break;
        }
    }

    // Board data
    const boardEntry: IZipEntry = await getEntryFromZip(scenarioZip, 'board.json');

    // Create parsing context
    const parsingContext = new ParsingContext(fileJSON, 'scenario.json', '', boardEntry, teamEntries, playerPrototypeEntries, shipEntries, abilityEntries);

    // Scenario data
    const scenarioEntry: IZipEntry = await getEntryFromZip(scenarioZip, 'scenario.json');
    const scenarioSource: IScenarioSource = await getJSONFromEntry(scenarioEntry) as unknown as IScenarioSource;
    return await Scenario.fromSource(parsingContext, scenarioSource, true);
}

/**
 * Gets file entry from a ZIP file
 *
 * @param    zip  ZIP file to extract from
 * @param    name Name or path to JSON file
 * @returns       Found zip entry
 */
async function getEntryFromZip(zip: AdmZip, name: string): Promise<IZipEntry> {
    // Find file in zip file
    const entry: IZipEntry | null = zip.getEntry(name);

    // If file was not found
    if (entry == null)
        throw new UnpackingError(`Could not find '${name}'`, 'root');

    return entry;
}

/**
 * Gets decompressed JSON contents from a ZIP entry
 *
 * @param    zipEntry ZIP Entry to decompress and parse JSON data
 * @returns           JSON data returned from ZIP entry
 */
export async function getJSONFromEntry(zipEntry: IZipEntry): Promise<JSON> {
    return new Promise<JSON>((resolve, reject) => {

        // Decompress and retrieve data
        zipEntry.getDataAsync(async (data: Buffer) => {
            // Try to parse data as JSON
            let json: JSON;
            try {
                json = await JSON.parse(data.toString());
            } catch (e: unknown) {
                if (e instanceof SyntaxError) {
                    reject(new UnpackingError(e.message, zipEntry.entryName));
                    return;
                }

                reject(e);
                return;
            }

            // Return parsed JSON
            resolve(json);
        });
    });
}

/**
 * UnpackingError - Server Version
 *
 * Thrown when an error is encountered during the scenario unpacking process
 */
export class UnpackingError extends Error {
    public readonly context: string;

    public constructor(message: string, context: string | ParsingContext) {
        super(message);

        if (context instanceof ParsingContext)
            this.context = `An error occurred whilst parsing '${context.currentFile}'`;
        else
            this.context = `An error occurred whilst parsing '${context}'`;

        Object.setPrototypeOf(this, UnpackingError.prototype);
    }

    /**
     * Factory function to generate UnpackingError based on `Joi.ValidationError`
     *
     * Useful for Joi validation
     *
     * @param    err            Joi validation error
     * @param    parsingContext Parsing context to use for context
     * @returns                 Created UnpackingError
     */
    public static fromJoiValidationError(err: Joi.ValidationError, parsingContext: ParsingContext): UnpackingError {
        return new UnpackingError(err.message.toString(), parsingContext);
    }
}