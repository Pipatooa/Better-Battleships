import AdmZip, {IZipEntry} from 'adm-zip';
import Joi from 'joi';
import {IScenarioSource, Scenario} from './scenario';

export type zipEntryMap = { [name: string]: IZipEntry };

/**
 * Unpacks a zip file into a scenario object asynchronously
 * @param scenarioZip Zip file to extract
 * @returns scenario -- Scenario object
 */
export async function unpack(scenarioZip: AdmZip): Promise<Scenario> {
    let scenario: Scenario;

    // Used to allow unpacking errors to reference the current file that is being processed during unpacking
    let currentFile: string = '';

    try {
        // Get a list of all zip entries
        let zipEntries = scenarioZip.getEntries();

        // Get entries for named objects
        let abilityEntries: zipEntryMap = {};
        let shipEntries: zipEntryMap = {};
        let playerPrototypeEntries: zipEntryMap = {};
        let teamEntries: zipEntryMap = {};

        zipEntries.forEach((entry) => {

            // Check entry regex
            let result = /^(abilities|ships|players|teams)\/([a-z\-]+).json$/.exec(entry.entryName);
            if (result == null)
                return;

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
        });

        // Board data
        currentFile = 'board.json';
        let boardEntry = await getEntryFromZip(scenarioZip, currentFile);

        // Scenario data
        currentFile = 'scenario.json';
        let scenarioEntry = await getEntryFromZip(scenarioZip, currentFile);
        let scenarioSource = await getJSONFromEntry(scenarioEntry) as unknown as IScenarioSource;
        scenario = await Scenario.fromSource(scenarioSource, boardEntry,
            teamEntries, playerPrototypeEntries, shipEntries, abilityEntries);
    } catch (e) {
        if (e instanceof UnpackingError)
            throw e.hasContext() ? e : e.withContext(currentFile);
        throw e;
    }

    return scenario;
}

/**
 * Gets file entry from a ZIP file
 * @param zip ZIP file to extract from
 * @param name Name or path to JSON file
 * @returns zipEntry -- Found zip entry
 */
async function getEntryFromZip(zip: AdmZip, name: string): Promise<IZipEntry> {
    // Find file in zip file
    let entry: IZipEntry | null = zip.getEntry(name);

    // If file was not found
    if (entry == null)
        throw new UnpackingError(`Could not find '${name}'`).withContext(name);

    return entry;
}

/**
 * Gets decompressed JSON contents from a ZIP entry
 * @param zipEntry ZIP Entry to decompress and parse JSON data
 * @returns json -- JSOn data returned from ZIP entry
 */
export async function getJSONFromEntry(zipEntry: IZipEntry): Promise<JSON> {
    return new Promise<JSON>((resolve, reject) => {

        // Decompress and retrieve data
        zipEntry.getDataAsync(async (data) => {
            // Try to parse data as JSON
            let json: JSON;
            try {
                json = await JSON.parse(data.toString());
            } catch (e) {
                if (e instanceof SyntaxError) {
                    reject(new UnpackingError(e.message).withContext(zipEntry.entryName));
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
    public constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UnpackingError.prototype);
    }

    private _context: string | undefined;

    /**
     * Getter function with formatting for context
     */
    public get context(): string | undefined {
        return `An error occurred whilst parsing '${this._context}'`;
    }

    /**
     * Factory function to generate UnpackingError based on `Joi.ValidationError`
     *
     * Useful for Joi validation
     *
     * @param err Joi validation error
     * @returns UnpackingError -- Created UnpackingError
     */
    public static fromJoiValidationError(err: Joi.ValidationError): UnpackingError {
        return new UnpackingError(err.message.toString());
    }

    /**
     * Sets the context for this unpacking error. Also returns this object
     * @param context New context to use
     * @returns self
     */
    public withContext(context: string): UnpackingError {
        this._context = context;
        return this;
    }

    /**
     * Returns whether this unpacking error has a context set yet
     * @returns boolean Whether this unpacking error has a context set already
     */
    public hasContext(): boolean {
        return this._context != undefined;
    }
}